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

// FSRS-inspired stability update
function computeNextReview(grade: number, prevStability: number | null, prevDifficulty: number | null) {
  const S = prevStability ?? 1;
  const D = prevDifficulty ?? 5;

  // Stability multiplier based on grade
  const gradeMultiplier = grade === 4 ? 2.5 : grade === 3 ? 1.8 : grade === 2 ? 1.2 : 0.4;
  const newStability = Math.max(0.5, S * gradeMultiplier * (1 + 0.1 * (10 - D) / 9));

  // Difficulty update
  const gradeDelta = -(grade - 3) * 0.8;
  let newDifficulty = D + gradeDelta * (10 - D) / 9;
  newDifficulty = Math.min(10, Math.max(1, newDifficulty));

  // Next review in S days (target 90% retention)
  const intervalDays = Math.ceil(newStability);
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
    state?.difficulty ?? null
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
