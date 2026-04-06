import { Router, type IRouter } from "express";
import { eq, and, lte, or, isNull, sql } from "drizzle-orm";
import { db, reviewsTable, cardStatesTable, cardsTable, studentModelsTable, usersTable } from "@workspace/db";
import { checkAndIssueStudentAchievements } from "../lib/check-achievements";
import { scheduleReview, computeRetrievability, stateToString } from "../lib/fsrs";
import { computeNextReview, retrievability, FSRS6_DEFAULT_PARAMS } from "../lib/fsrs";
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
/** Milliseconds in one day — used for elapsed-days calculation. */
const MS_PER_DAY = 86_400_000;

/**
 * Load the FSRS-6 parameter vector for a student.
 * Falls back to population defaults if no personalised model exists yet.
 */
async function loadStudentParams(studentId: number): Promise<number[]> {
  const [model] = await db
    .select({ params: studentModelsTable.params })
    .from(studentModelsTable)
    .where(eq(studentModelsTable.studentId, studentId));
  return model?.params ?? [...FSRS6_DEFAULT_PARAMS];
}

/**
 * Ensure a studentModels row exists and increment its review counter.
 * Uses an upsert so that the first review for a student creates the row.
 */
async function incrementStudentReviewCount(studentId: number): Promise<void> {
  const [existing] = await db
    .select({ id: studentModelsTable.id, reviewCount: studentModelsTable.reviewCount })
    .from(studentModelsTable)
    .where(eq(studentModelsTable.studentId, studentId));

  if (existing) {
    await db
      .update(studentModelsTable)
      .set({
        reviewCount: existing.reviewCount + 1,
        lastUpdatedAt: new Date(),
      })
      .where(eq(studentModelsTable.id, existing.id));
  } else {
    await db.insert(studentModelsTable).values({
      studentId,
      params: [...FSRS6_DEFAULT_PARAMS],
      reviewCount: 1,
    });
  }
}

// ── POST /reviews ─────────────────────────────────────────────────────────────
router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = SubmitReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentId, cardId, deckId, grade } = parsed.data;
  const now = new Date();

  // Fetch the current card state (may be undefined for a brand-new card)
  const recalled = grade >= 2;

  // Load per-student FSRS-6 parameters (or population defaults)
  const w = await loadStudentParams(studentId);

  // Get current card state — also gives us lastReviewedAt for elapsed time
  const [state] = await db
    .select()
    .from(cardStatesTable)
    .where(and(eq(cardStatesTable.studentId, studentId), eq(cardStatesTable.cardId, cardId)));

  // Compute elapsed days server-side from the stored last-review timestamp
  const elapsedDays = state?.lastReviewedAt
    ? (now.getTime() - new Date(state.lastReviewedAt).getTime()) / MS_PER_DAY
    : 0;

  // Run the FSRS-6 scheduler via ts-fsrs
  const { card: newCard } = scheduleReview(state, grade, now);

  const recalled = grade >= 2;

  // Persist the review log
  // Compute elapsed days server-side from the last review timestamp.
  // This is the true inter-review interval required by FSRS-6, not the
  // time the student spent looking at the card during the current session.
  const elapsedDays =
    state?.lastReviewedAt
      ? (Date.now() - new Date(state.lastReviewedAt).getTime()) / MS_PER_DAY
      : 0;

  const { newStability, newDifficulty, nextReviewAt } = computeNextReview(
    grade,
    state?.stability ?? null,
    state?.difficulty ?? null,
    elapsedDays,
    w,
  );

  // Insert review record
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
      stabilityAfter: newCard.stability,
      difficultyAfter: newCard.difficulty,
      nextReviewAt: newCard.due,
    })
    .returning();

  // Upsert the card state
  const stateData = {
    stability: newCard.stability,
    difficulty: newCard.difficulty,
    fsrsState: stateToString(newCard.state),
    lapses: newCard.lapses,
    scheduledDays: newCard.scheduled_days,
    reviewCount: newCard.reps,
    lastReviewedAt: now,
    nextReviewAt: newCard.due,
  };

  if (state) {
    await db.update(cardStatesTable).set(stateData).where(eq(cardStatesTable.id, state.id));
  } else {
    await db.insert(cardStatesTable).values({ studentId, cardId, deckId, ...stateData });
  }

  // Fire-and-forget achievement check
  // Update streak columns on the users table
  await db
    .update(usersTable)
    .set({ lastStudyDate: new Date() })
    .where(eq(usersTable.id, studentId));

  // Non-blocking: persist student review count + check achievements
  incrementStudentReviewCount(studentId).catch(() => {});
  checkAndIssueStudentAchievements(studentId).catch(() => {});

  res.status(201).json(review);
});

// ── GET /students/:studentId/due-cards ────────────────────────────────────────
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

  // Load per-student parameters for consistent retrievability computation
  const w = await loadStudentParams(params.data.studentId);

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
      fsrsState: cardStatesTable.fsrsState,
      lapses: cardStatesTable.lapses,
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
        eq(cardStatesTable.studentId, params.data.studentId),
      ),
    )
    .where(
      and(
        query.data.deckId ? eq(cardsTable.deckId, query.data.deckId) : undefined,
        or(isNull(cardStatesTable.nextReviewAt), lte(cardStatesTable.nextReviewAt, now)),
      ),
    )
    .orderBy(sql`${cardStatesTable.nextReviewAt} asc nulls first`)
    .limit(50);

  const result = dueCards.map((card) => {
    const stateForCalc = card.lastReviewedAt
      ? {
          stability: card.stabilityDays ?? 0,
          difficulty: card.difficulty ?? 0,
          fsrsState: card.fsrsState ?? "New",
          lapses: card.lapses ?? 0,
          scheduledDays: 0,
          reviewCount: card.reviewCount,
          lastReviewedAt: card.lastReviewedAt,
          nextReviewAt: card.nextReviewAt,
        }
      : null;

    const predictedRetention = computeRetrievability(stateForCalc, now);
  // Compute predicted retention using the same power-law formula as the scheduler
  const result = dueCards.map((card) => {
    let predictedRetention: number | null = null;
    if (card.stabilityDays && card.lastReviewedAt) {
      const daysSince = (now.getTime() - new Date(card.lastReviewedAt).getTime()) / MS_PER_DAY;
      predictedRetention = retrievability(daysSince, card.stabilityDays, w);
    }
    return { ...card, predictedRetention };
  });

  res.json(GetDueCardsResponse.parse(result));
});

// ── GET /students/:studentId/reviews ─────────────────────────────────────────
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

// ── POST /students/:studentId/reset-progress ─────────────────────────────────
router.post("/students/:studentId/reset-progress", async (req, res): Promise<void> => {
  const params = GetDueCardsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db
    .update(cardStatesTable)
    .set({ nextReviewAt: today })
    .where(eq(cardStatesTable.studentId, params.data.studentId));

  res.json({ success: true, message: "Study progress reset for today" });
});

export default router;
