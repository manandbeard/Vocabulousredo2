import { Router, type IRouter } from "express";
import { eq, and, lte, or, isNull, sql } from "drizzle-orm";
import { db, reviewsTable, cardStatesTable, cardsTable } from "@workspace/db";
import { checkAndIssueStudentAchievements } from "../lib/check-achievements";
import {
  SubmitReviewBody,
  GetDueCardsParams,
  GetDueCardsQueryParams,
  GetDueCardsResponse,
  ListStudentReviewsParams,
  ListStudentReviewsQueryParams,
  ListStudentReviewsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// FSRS-6 default parameters (w0–w20)
const W: number[] = [
  0.40255, 1.18385, 3.1262, 15.4722, // w0-w3: initial stability for grades 1-4
  7.2102,                              // w4: initial difficulty
  0.5316,                              // w5: mean reversion weight
  1.0651,                              // w6: difficulty delta scale
  0.06957,                             // w7: (reserved)
  1.58,                                // w8: success stability growth base
  0.1544,                              // w9: stability decay exponent
  1.0038,                              // w10: success retrievability boost
  1.9395,                              // w11: lapse stability multiplier
  0.11,                                // w12: lapse difficulty exponent
  0.29605,                             // w13: lapse stability growth exponent
  2.2698,                              // w14: lapse retrievability exponent
  0.2315,                              // w15: hard grade stability modifier
  2.9898,                              // w16: easy grade stability modifier
  0.51655,                             // w17: (reserved)
  0.6621,                              // w18: (reserved)
  0.1,                                 // w19: (reserved)
  0.1,                                 // w20: power-law exponent for R(t, S)
];

// Power-law retrievability: R(t, S) = (0.9^(1/S))^(t^w20)
function retrievability(elapsedDays: number, stability: number): number {
  if (elapsedDays <= 0) return 1;
  return Math.pow(0.9, Math.pow(elapsedDays, W[20]) / stability);
}

// Initial difficulty for a new card based on first review grade
function initialDifficulty(grade: number): number {
  // D_0 = w4 - e^(w5*(grade-1)) + 1, clamped to [1, 10]
  return Math.min(10, Math.max(1, W[4] - Math.exp(W[5] * (grade - 1)) + 1));
}

// Initial stability for a new card based on first review grade
function initialStability(grade: number): number {
  // w0=Again, w1=Hard, w2=Good, w3=Easy
  return Math.max(0.1, W[grade - 1]);
}

// FSRS-6 full implementation
function computeNextReview(
  grade: number,
  prevStability: number | null,
  prevDifficulty: number | null,
  elapsedDays: number,
) {
  const isNewCard = prevStability === null;

  let newStability: number;
  let newDifficulty: number;

  if (isNewCard) {
    // First review: use initial stability and difficulty from grade
    newStability = initialStability(grade);
    newDifficulty = initialDifficulty(grade);
  } else {
    const S = prevStability!;
    const D = prevDifficulty ?? W[4];
    const R = retrievability(elapsedDays, S);

    if (grade === 1) {
      // Lapse (Again): stability after forgetting
      // S_f = w11 · D^(-w12) · ((S+1)^w13 - 1) · e^(w14·(1-R))
      newStability = Math.max(
        0.1,
        W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)),
      );
    } else {
      // Success (Hard/Good/Easy): stability growth
      // Grade modifier: Hard=w15, Good=1, Easy=w16
      const gradeMod = grade === 2 ? W[15] : grade === 4 ? W[16] : 1.0;
      // S' = S · (e^w8 · (11-D) · S^(-w9) · (e^(w10·(1-R)) - 1) · gradeMod + 1)
      newStability = Math.max(
        S,
        S * (Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * gradeMod + 1),
      );
    }

    // Difficulty update with mean reversion
    // ΔD = -w6 · (G - 3)
    const deltaD = -W[6] * (grade - 3);
    // D'' = D + ΔD · (10 - D) / 9   (linear damping toward max)
    const dPrime = D + deltaD * ((10 - D) / 9);
    // D' = w5 · D_0(grade=4) + (1 - w5) · D''   (mean reversion)
    const d0Easy = initialDifficulty(4);
    newDifficulty = Math.min(10, Math.max(1, W[5] * d0Easy + (1 - W[5]) * dPrime));
  }

  // Interval = stability (days until 90% retention), minimum 1 day
  const intervalDays = Math.max(1, Math.round(newStability));
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { newStability, newDifficulty, nextReviewAt };
}

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = SubmitReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentId, cardId, deckId, grade, elapsedDays } = parsed.data;
  const recalled = grade >= 2;

  // Get current card state
  const [state] = await db
    .select()
    .from(cardStatesTable)
    .where(and(eq(cardStatesTable.studentId, studentId), eq(cardStatesTable.cardId, cardId)));

  const { newStability, newDifficulty, nextReviewAt } = computeNextReview(
    grade,
    state?.stability ?? null,
    state?.difficulty ?? null,
    elapsedDays,
  );

  // Insert review
  const [review] = await db
    .insert(reviewsTable)
    .values({
      studentId,
      cardId,
      deckId,
      grade,
      recalled,
      elapsedDays,
      stabilityBefore: state?.stability ?? null,
      stabilityAfter: newStability,
      difficultyAfter: newDifficulty,
      nextReviewAt,
    })
    .returning();

  // Upsert card state
  if (state) {
    await db
      .update(cardStatesTable)
      .set({
        stability: newStability,
        difficulty: newDifficulty,
        reviewCount: (state.reviewCount ?? 0) + 1,
        lastReviewedAt: new Date(),
        nextReviewAt,
      })
      .where(eq(cardStatesTable.id, state.id));
  } else {
    await db.insert(cardStatesTable).values({
      studentId,
      cardId,
      deckId,
      stability: newStability,
      difficulty: newDifficulty,
      reviewCount: 1,
      lastReviewedAt: new Date(),
      nextReviewAt,
    });
  }

  // Fire-and-forget achievement check (non-blocking)
  checkAndIssueStudentAchievements(studentId).catch(() => {});

  res.status(201).json(review);
});

router.get("/students/:studentId/due-cards", async (req, res): Promise<void> => {
  const params = GetDueCardsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = GetDueCardsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const now = new Date();

  // Cards that are due (next review <= now) or never reviewed
  const dueCards = await db
    .select({
      cardId: cardsTable.id,
      deckId: cardsTable.deckId,
      front: cardsTable.front,
      back: cardsTable.back,
      hint: cardsTable.hint,
      cardType: cardsTable.cardType,
      imageUrl: cardsTable.imageUrl,
      mcOptions: cardsTable.mcOptions,
      mcCorrectIndex: cardsTable.mcCorrectIndex,
      importance: cardsTable.importance,
      stabilityDays: cardStatesTable.stability,
      difficulty: cardStatesTable.difficulty,
      reviewCount: sql<number>`coalesce(${cardStatesTable.reviewCount}, 0)`,
      lastReviewedAt: cardStatesTable.lastReviewedAt,
      nextReviewAt: cardStatesTable.nextReviewAt,
      isNew: sql<boolean>`${cardStatesTable.id} is null`,
    })
    .from(cardsTable)
    .leftJoin(
      cardStatesTable,
      and(
        eq(cardsTable.id, cardStatesTable.cardId),
        eq(cardStatesTable.studentId, params.data.studentId)
      )
    )
    .where(
      and(
        query.data.deckId ? eq(cardsTable.deckId, query.data.deckId) : undefined,
        or(isNull(cardStatesTable.nextReviewAt), lte(cardStatesTable.nextReviewAt, now))
      )
    )
    .orderBy(sql`${cardStatesTable.nextReviewAt} asc nulls first`)
    .limit(50);

  // Compute predicted retention
  const result = dueCards.map((card) => {
    let predictedRetention: number | null = null;
    if (card.stabilityDays && card.lastReviewedAt) {
      const daysSince = (now.getTime() - new Date(card.lastReviewedAt).getTime()) / 86400000;
      predictedRetention = Math.pow(0.9, daysSince / card.stabilityDays);
    }
    return { ...card, predictedRetention };
  });

  res.json(GetDueCardsResponse.parse(result));
});

router.get("/students/:studentId/reviews", async (req, res): Promise<void> => {
  const params = ListStudentReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = ListStudentReviewsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [eq(reviewsTable.studentId, params.data.studentId)];
  if (query.data.deckId) conditions.push(eq(reviewsTable.deckId, query.data.deckId));

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(and(...conditions))
    .orderBy(sql`${reviewsTable.reviewedAt} desc`)
    .limit(query.data.limit ?? 100);

  res.json(ListStudentReviewsResponse.parse(reviews));
});

router.post("/students/:studentId/reset-progress", async (req, res): Promise<void> => {
  const params = GetDueCardsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const studentId = params.data.studentId;

  // Reset all card states' nextReviewAt to today (so they appear as due cards again)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db
    .update(cardStatesTable)
    .set({ nextReviewAt: today })
    .where(eq(cardStatesTable.studentId, studentId));

  res.json({ success: true, message: "Study progress reset for today" });
});

export default router;
