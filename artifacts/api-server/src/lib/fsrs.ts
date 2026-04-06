/**
 * FSRS-6 scheduling wrapper using the official ts-fsrs package.
 *
 * The ts-fsrs Card object is the canonical state. We map it to/from
 * our cardStatesTable rows using the helpers below.
 */
import { createEmptyCard, fsrs, Rating, State, type Card as FSRSCard, type Grade } from "ts-fsrs";
import type { CardState } from "@workspace/db";

// Default FSRS-6 scheduler for a school context:
// - 90% target retention
// - fuzz enabled (±5% randomisation prevents "review storms")
// - short-term learning steps enabled (1m / 10m before long-term scheduling)
export const scheduler = fsrs({
  request_retention: 0.9,
  enable_fuzz: true,
  enable_short_term: true,
});

/** Map a grade integer (1–4) to an FSRS Grade (Again/Hard/Good/Easy). */
export function gradeToRating(grade: number): Grade {
  switch (grade) {
    case 1: return Rating.Again as Grade;
    case 2: return Rating.Hard as Grade;
    case 3: return Rating.Good as Grade;
    case 4: return Rating.Easy as Grade;
    default: return Rating.Good as Grade;
  }
}

/** Map the ts-fsrs State enum to its string name for DB storage. */
export function stateToString(state: State): string {
  switch (state) {
    case State.New: return "New";
    case State.Learning: return "Learning";
    case State.Review: return "Review";
    case State.Relearning: return "Relearning";
    default: return "New";
  }
}

/** Map the DB fsrsState string back to the ts-fsrs State enum. */
export function stringToState(s: string | null | undefined): State {
  switch (s) {
    case "Learning": return State.Learning;
    case "Review": return State.Review;
    case "Relearning": return State.Relearning;
    default: return State.New;
  }
}

/**
 * Reconstruct a ts-fsrs Card from a cardStatesTable row.
 * If no row exists (new card), returns a fresh empty card.
 */
export function cardStateToFSRS(state: CardState | undefined | null): FSRSCard {
  if (!state) return createEmptyCard();

  // Build a complete Card object; learning_steps defaults to 0 for restored cards
  const card: FSRSCard = {
    due: state.nextReviewAt ? new Date(state.nextReviewAt) : new Date(),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: 0, // deprecated in ts-fsrs v5, recalculated internally
    scheduled_days: state.scheduledDays ?? 0,
    learning_steps: 0,
    reps: state.reviewCount ?? 0,
    lapses: state.lapses ?? 0,
    state: stringToState(state.fsrsState),
    last_review: state.lastReviewedAt ? new Date(state.lastReviewedAt) : undefined,
  };
  return card;
}

/**
 * Run the FSRS scheduler for a single review.
 * Returns the updated Card and the log entry.
 */
export function scheduleReview(existingState: CardState | undefined | null, grade: number, now: Date) {
  const card = cardStateToFSRS(existingState);
  const rating = gradeToRating(grade);
  return scheduler.next(card, now, rating);
}

/**
 * Compute current retrievability (0–1) for a card state.
 * Returns null for cards that have never been reviewed.
 */
export function computeRetrievability(
  state: Pick<CardState, "stability" | "lastReviewedAt" | "nextReviewAt" | "scheduledDays" | "reviewCount" | "lapses" | "fsrsState"> | null | undefined,
  now: Date,
): number | null {
  if (!state?.lastReviewedAt) return null;

  const card = cardStateToFSRS(state as CardState);
  return scheduler.get_retrievability(card, now, false);
 * FSRS-6 scheduling math.
 *
 * All pure functions accept an explicit `w` parameter array so that
 * per-student personalised parameters can be substituted seamlessly.
 * The default population parameters are imported from `@workspace/db` so
 * there is a single authoritative source of truth.
 */

import { FSRS6_DEFAULT_PARAMS } from "@workspace/db";

export { FSRS6_DEFAULT_PARAMS };

// ─── Core constants ───────────────────────────────────────────────────────────

/** Difficulty is clamped to the range [MIN_DIFFICULTY, MAX_DIFFICULTY]. */
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

/**
 * Power-law forgetting curve: R(t, S) = (0.9^(1/S))^(t^w20)
 * Equivalent to: 0.9^(t^w20 / S)
 */
export function retrievability(
  elapsedDays: number,
  stability: number,
  w: number[] = FSRS6_DEFAULT_PARAMS,
): number {
  if (elapsedDays <= 0) return 1;
  return Math.pow(0.9, Math.pow(elapsedDays, w[20]) / stability);
}

/**
 * Initial difficulty for a card given the grade on its very first review.
 * D_0 = w4 - e^(w5*(grade-1)) + 1, clamped to [1, 10].
 */
export function initialDifficulty(
  grade: number,
  w: number[] = FSRS6_DEFAULT_PARAMS,
): number {
  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, w[4] - Math.exp(w[5] * (grade - 1)) + 1));
}

/**
 * Initial stability for a card given the grade on its very first review.
 * w0=Again, w1=Hard, w2=Good, w3=Easy.
 */
export function initialStability(
  grade: number,
  w: number[] = FSRS6_DEFAULT_PARAMS,
): number {
  return Math.max(0.1, w[grade - 1]);
}

export interface NextReviewResult {
  newStability: number;
  newDifficulty: number;
  nextReviewAt: Date;
}

/**
 * Full FSRS-6 state transition.
 *
 * @param grade        1=Again, 2=Hard, 3=Good, 4=Easy
 * @param prevStability null on the first review of a card
 * @param prevDifficulty null on the first review of a card
 * @param elapsedDays  Days since the last review (0 for first review)
 * @param w            FSRS-6 parameter array (defaults to population params)
 */
export function computeNextReview(
  grade: number,
  prevStability: number | null,
  prevDifficulty: number | null,
  elapsedDays: number,
  w: number[] = FSRS6_DEFAULT_PARAMS,
): NextReviewResult {
  const isNewCard = prevStability === null;

  let newStability: number;
  let newDifficulty: number;

  if (isNewCard) {
    newStability = initialStability(grade, w);
    newDifficulty = initialDifficulty(grade, w);
  } else {
    const S = prevStability!;
    const D = prevDifficulty ?? w[4];
    const R = retrievability(elapsedDays, S, w);

    if (grade === 1) {
      // Lapse (Again): stability after forgetting
      // S_f = w11 · D^(-w12) · ((S+1)^w13 - 1) · e^(w14·(1-R))
      newStability = Math.max(
        0.1,
        w[11] *
          Math.pow(D, -w[12]) *
          (Math.pow(S + 1, w[13]) - 1) *
          Math.exp(w[14] * (1 - R)),
      );
    } else {
      // Success (Hard/Good/Easy): stability growth
      // Grade modifier: Hard=w15, Good=1, Easy=w16
      const gradeMod = grade === 2 ? w[15] : grade === 4 ? w[16] : 1.0;
      // S' = S · (e^w8 · (11-D) · S^(-w9) · (e^(w10·(1-R)) - 1) · gradeMod + 1)
      newStability = Math.max(
        S,
        S *
          (Math.exp(w[8]) *
            (MAX_DIFFICULTY + 1 - D) *
            Math.pow(S, -w[9]) *
            (Math.exp(w[10] * (1 - R)) - 1) *
            gradeMod +
            1),
      );
    }

    // Difficulty update with mean reversion
    // ΔD = -w6 · (G - 3)
    const deltaD = -w[6] * (grade - 3);
    // D'' = D + ΔD · (10 - D) / 9   (linear damping toward max)
    const dPrime = D + deltaD * ((MAX_DIFFICULTY - D) / (MAX_DIFFICULTY - MIN_DIFFICULTY));
    // D' = w5 · D_0(grade=4) + (1 - w5) · D''   (mean reversion)
    const d0Easy = initialDifficulty(4, w);
    newDifficulty = Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, w[5] * d0Easy + (1 - w[5]) * dPrime));
  }

  // Interval = stability (days until 90% retention), minimum 1 day
  const intervalDays = Math.max(1, Math.round(newStability));
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { newStability, newDifficulty, nextReviewAt };
}
