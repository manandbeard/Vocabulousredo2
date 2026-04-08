import { Router, type IRouter } from "express";
import { eq, and, lte, or, isNull, sql, inArray } from "drizzle-orm";
import { db, reviewsTable, cardStatesTable, cardsTable, studentModelsTable, usersTable, enrollmentsTable, decksTable, classesTable } from "@workspace/db";
import { checkAndIssueStudentAchievements } from "../lib/check-achievements";
import {
  scheduleReview,
  computeRetrievability,
  stateToString,
  computeNextReview,
  FSRS6_DEFAULT_PARAMS,
} from "../lib/fsrs";
import {
  SubmitReviewBody,
  GetDueCardsParams,
  GetDueCardsQueryParams,
  GetDueCardsResponse,
  ListStudentReviewsParams,
  ListStudentReviewsQueryParams,
  ListStudentReviewsResponse,
  GetStudentResearchDecksParams,
  GetStudentResearchDecksQueryParams,
  GetStudentResearchDecksResponse,
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

  const recalled = grade >= 2;

  // Load per-student FSRS-6 parameters (or population defaults)
  const w = await loadStudentParams(studentId);

  // Get current card state — also gives us lastReviewedAt for elapsed time
  const [state] = await db
    .select()
    .from(cardStatesTable)
    .where(and(eq(cardStatesTable.studentId, studentId), eq(cardStatesTable.cardId, cardId)));

  // Compute elapsed days server-side from the stored last-review timestamp.
  // This is the true inter-review interval required by FSRS-6, not the
  // time the student spent looking at the card during the current session.
  const elapsedDays = state?.lastReviewedAt
    ? (now.getTime() - new Date(state.lastReviewedAt).getTime()) / MS_PER_DAY
    : 0;

  // Run the FSRS-6 scheduler via ts-fsrs
  const { card: newCard } = scheduleReview(state, grade, now);

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

  // Update last study date on the user record
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

  // Compute predicted retention using the power-law retrievability formula
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

// ── GET /students/:studentId/research-decks ───────────────────────────────────
router.get("/students/:studentId/research-decks", async (req, res): Promise<void> => {
  const params = GetStudentResearchDecksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = GetStudentResearchDecksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { studentId } = params.data;
  const { tag, mastery } = query.data;

  // Get all classIds the student is enrolled in
  const enrollments = await db
    .select({ classId: enrollmentsTable.classId })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.studentId, studentId));

  if (enrollments.length === 0) {
    res.json(GetStudentResearchDecksResponse.parse([]));
    return;
  }

  const classIds = enrollments.map((e) => e.classId);

  // Get all decks for those classes with card count
  const deckRows = await db
    .select({
      deckId: decksTable.id,
      deckName: decksTable.name,
      classId: decksTable.classId,
      className: classesTable.name,
      cardCount: sql<number>`cast(count(distinct ${cardsTable.id}) as int)`,
    })
    .from(decksTable)
    .leftJoin(classesTable, eq(decksTable.classId, classesTable.id))
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(inArray(decksTable.classId, classIds))
    .groupBy(decksTable.id, classesTable.name);

  if (deckRows.length === 0) {
    res.json(GetStudentResearchDecksResponse.parse([]));
    return;
  }

  const deckIds = deckRows.map((d) => d.deckId);

  // Get all card states for this student across those decks
  const cardStates = await db
    .select({
      deckId: cardStatesTable.deckId,
      stability: cardStatesTable.stability,
      reviewCount: cardStatesTable.reviewCount,
    })
    .from(cardStatesTable)
    .where(and(eq(cardStatesTable.studentId, studentId), inArray(cardStatesTable.deckId, deckIds)));

  // Get all tags for cards in those decks
  const cardTagRows = await db
    .select({ deckId: cardsTable.deckId, tags: cardsTable.tags })
    .from(cardsTable)
    .where(inArray(cardsTable.deckId, deckIds));

  // Aggregate per-deck tag list (union of all card tags)
  const deckTagMap = new Map<number, Set<string>>();
  for (const row of cardTagRows) {
    if (!row.deckId) continue;
    let tagSet = deckTagMap.get(row.deckId);
    if (!tagSet) { tagSet = new Set(); deckTagMap.set(row.deckId, tagSet); }
    for (const t of row.tags ?? []) tagSet.add(t);
  }

  // Aggregate card states per deck
  const deckStateMap = new Map<number, { masteredCount: number; learningCount: number; totalStated: number }>();
  for (const state of cardStates) {
    if (!state.deckId) continue;
    let agg = deckStateMap.get(state.deckId);
    if (!agg) { agg = { masteredCount: 0, learningCount: 0, totalStated: 0 }; deckStateMap.set(state.deckId, agg); }
    agg.totalStated++;
    if ((state.stability ?? 0) >= 21) agg.masteredCount++;
    else agg.learningCount++;
  }

  // Build result
  const result = deckRows.map((deck) => {
    const states = deckStateMap.get(deck.deckId) ?? { masteredCount: 0, learningCount: 0, totalStated: 0 };
    const newCount = Math.max(0, deck.cardCount - states.totalStated);
    const masteredCount = states.masteredCount;
    const learningCount = states.learningCount;
    const total = deck.cardCount;

    const masteryPct = total > 0 ? masteredCount / total : 0;

    let masteryLevel: "new" | "learning" | "mastered";
    if (masteredCount > 0 && masteredCount >= total * 0.8) {
      masteryLevel = "mastered";
    } else if (states.totalStated > 0) {
      masteryLevel = "learning";
    } else {
      masteryLevel = "new";
    }

    const tags = Array.from(deckTagMap.get(deck.deckId) ?? []);

    return {
      deckId: deck.deckId,
      deckName: deck.deckName,
      classId: deck.classId,
      className: deck.className ?? null,
      tags,
      cardCount: total,
      masteryPct,
      masteryLevel,
    };
  });

  // Apply filters
  let filtered = result;
  if (tag) {
    filtered = filtered.filter((d) => d.tags.includes(tag));
  }
  if (mastery) {
    filtered = filtered.filter((d) => d.masteryLevel === mastery);
  }

  res.json(GetStudentResearchDecksResponse.parse(filtered));
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
