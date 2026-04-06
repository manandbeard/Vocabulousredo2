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
}
