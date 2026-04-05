/**
 * FSRS-6 scheduling math.
 *
 * All pure functions accept an explicit `w` parameter array so that
 * per-student personalised parameters can be substituted seamlessly.
 * The default population parameters are imported from `@workspace/db` so
 * there is a single authoritative source of truth.
 */

import { FSRS6_DEFAULT_PARAMS } from "@workspace/db";

export { FSRS6_DEFAULT_PARAMS };

// ─── Core math ───────────────────────────────────────────────────────────────

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
  return Math.min(10, Math.max(1, w[4] - Math.exp(w[5] * (grade - 1)) + 1));
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
            (11 - D) *
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
    const dPrime = D + deltaD * ((10 - D) / 9);
    // D' = w5 · D_0(grade=4) + (1 - w5) · D''   (mean reversion)
    const d0Easy = initialDifficulty(4, w);
    newDifficulty = Math.min(10, Math.max(1, w[5] * d0Easy + (1 - w[5]) * dPrime));
  }

  // Interval = stability (days until 90% retention), minimum 1 day
  const intervalDays = Math.max(1, Math.round(newStability));
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { newStability, newDifficulty, nextReviewAt };
}
