import { Router, type IRouter } from "express";
import { eq, sql, and, gte, inArray, isNotNull } from "drizzle-orm";
import {
  db,
  classesTable,
  enrollmentsTable,
  decksTable,
  cardsTable,
  reviewsTable,
  usersTable,
  cardStatesTable,
  studySessionsTable,
  aiPersonasTable,
  alertsTable,
} from "@workspace/db";
import {
  GetTeacherAnalyticsParams,
  GetTeacherAnalyticsResponse,
  GetClassAnalyticsParams,
  GetClassAnalyticsResponse,
  GetStudentAnalyticsParams,
  GetStudentAnalyticsResponse,
  GetAtRiskStudentsParams,
  GetAtRiskStudentsResponse,
  GetStudentPersonaParams,
  GetStudentPersonaResponse,
  GetStudentStudyTimeParams,
  GetStudentStudyTimeResponse,
  GetStudentKnowledgeGraphParams,
  GetStudentKnowledgeGraphResponse,
  GetTeacherStudentsParams,
  GetTeacherStudentsResponse,
  GetStudentDetailParams,
  GetStudentDetailQueryParams,
  GetStudentDetailResponse,
} from "@workspace/api-zod";
import { computeStreak } from "../lib/streak";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/analytics/teacher/:teacherId", async (req, res): Promise<void> => {
  const params = GetTeacherAnalyticsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { teacherId } = params.data;

  const [counts] = await db
    .select({
      totalClasses: sql<number>`cast(count(distinct ${classesTable.id}) as int)`,
      totalDecks: sql<number>`cast(count(distinct ${decksTable.id}) as int)`,
      totalCards: sql<number>`cast(count(distinct ${cardsTable.id}) as int)`,
    })
    .from(classesTable)
    .leftJoin(decksTable, eq(classesTable.id, decksTable.classId))
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(classesTable.teacherId, teacherId));

  const [studentCount] = await db
    .select({ totalStudents: sql<number>`cast(count(distinct ${enrollmentsTable.studentId}) as int)` })
    .from(enrollmentsTable)
    .innerJoin(classesTable, eq(enrollmentsTable.classId, classesTable.id))
    .where(eq(classesTable.teacherId, teacherId));

  const [reviewCount] = await db
    .select({ totalReviews: sql<number>`cast(count(distinct ${reviewsTable.id}) as int)` })
    .from(reviewsTable)
    .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .innerJoin(classesTable, eq(decksTable.classId, classesTable.id))
    .where(eq(classesTable.teacherId, teacherId));

  const classRows = await db
    .select({
      classId: classesTable.id,
      className: classesTable.name,
      studentCount: sql<number>`cast(count(distinct ${enrollmentsTable.studentId}) as int)`,
      totalReviews: sql<number>`cast(count(distinct ${reviewsTable.id}) as int)`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0 
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
    })
    .from(classesTable)
    .leftJoin(enrollmentsTable, eq(classesTable.id, enrollmentsTable.classId))
    .leftJoin(reviewsTable, eq(enrollmentsTable.studentId, reviewsTable.studentId))
    .where(eq(classesTable.teacherId, teacherId))
    .groupBy(classesTable.id);

  const classBreakdown = classRows.map((c) => ({ ...c, atRiskCount: 0 }));

  const avgRetention =
    classBreakdown.length > 0
      ? classBreakdown.reduce((s, c) => s + (c.averageRetention ?? 0), 0) / classBreakdown.length
      : null;

  res.json(
    GetTeacherAnalyticsResponse.parse({
      teacherId,
      totalClasses: counts?.totalClasses ?? 0,
      totalStudents: studentCount?.totalStudents ?? 0,
      totalDecks: counts?.totalDecks ?? 0,
      totalCards: counts?.totalCards ?? 0,
      totalReviews: reviewCount?.totalReviews ?? 0,
      averageClassRetention: avgRetention,
      classBreakdown,
    })
  );
});

router.get("/analytics/class/:classId", async (req, res): Promise<void> => {
  const params = GetClassAnalyticsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { classId } = params.data;

  const [cls] = await db
    .select({ name: classesTable.name })
    .from(classesTable)
    .where(eq(classesTable.id, classId));

  const [counts] = await db
    .select({
      studentCount: sql<number>`cast(count(distinct ${enrollmentsTable.studentId}) as int)`,
      deckCount: sql<number>`cast(count(distinct ${decksTable.id}) as int)`,
      totalReviews: sql<number>`cast(count(distinct ${reviewsTable.id}) as int)`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0 
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
    })
    .from(classesTable)
    .leftJoin(enrollmentsTable, eq(classesTable.id, enrollmentsTable.classId))
    .leftJoin(decksTable, eq(classesTable.id, decksTable.classId))
    .leftJoin(reviewsTable, eq(enrollmentsTable.studentId, reviewsTable.studentId))
    .where(eq(classesTable.id, classId));

  // Retention trend — last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const retentionTrend = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
      retention: sql<number>`cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)`,
      reviewCount: sql<number>`cast(count(${reviewsTable.id}) as int)`,
    })
    .from(reviewsTable)
    .innerJoin(enrollmentsTable, eq(reviewsTable.studentId, enrollmentsTable.studentId))
    .where(and(eq(enrollmentsTable.classId, classId), gte(reviewsTable.reviewedAt, thirtyDaysAgo)))
    .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
    .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`);

  // Card mastery distribution using card states
  const masteryRows = await db
    .select({
      reviewCount: cardStatesTable.reviewCount,
      stability: cardStatesTable.stability,
    })
    .from(cardStatesTable)
    .innerJoin(cardsTable, eq(cardStatesTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.classId, classId));

  const mastery = { new: 0, learning: 0, reviewing: 0, mastered: 0 };
  // Count distinct cards as new that have no state entry
  const [cardCountRow] = await db
    .select({ total: sql<number>`cast(count(${cardsTable.id}) as int)` })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.classId, classId));

  mastery.new = Math.max(0, (cardCountRow?.total ?? 0) - masteryRows.length);
  masteryRows.forEach((row) => {
    if ((row.reviewCount ?? 0) === 0) mastery.new++;
    else if ((row.stability ?? 0) < 3) mastery.learning++;
    else if ((row.stability ?? 0) < 21) mastery.reviewing++;
    else mastery.mastered++;
  });

  // Top struggle cards
  const topStruggleCards = await db
    .select({
      cardId: cardsTable.id,
      front: cardsTable.front,
      averageGrade: sql<number>`cast(avg(${reviewsTable.grade}) as double precision)`,
      totalReviews: sql<number>`cast(count(${reviewsTable.id}) as int)`,
      recallRate: sql<number>`cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)`,
    })
    .from(reviewsTable)
    .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.classId, classId))
    .groupBy(cardsTable.id)
    .orderBy(sql`avg(${reviewsTable.grade}) asc`)
    .limit(5);

  res.json(
    GetClassAnalyticsResponse.parse({
      classId,
      className: cls?.name ?? "",
      studentCount: counts?.studentCount ?? 0,
      deckCount: counts?.deckCount ?? 0,
      totalReviews: counts?.totalReviews ?? 0,
      averageRetention: counts?.averageRetention ?? null,
      retentionTrend,
      cardMasteryDistribution: mastery,
      topStruggleCards,
    })
  );
});

router.get("/analytics/student/:studentId", async (req, res): Promise<void> => {
  const params = GetStudentAnalyticsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { studentId } = params.data;
  const now = new Date();

  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, studentId));

  const [reviewStats] = await db
    .select({
      totalReviews: sql<number>`cast(count(${reviewsTable.id}) as int)`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0 
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.studentId, studentId));

  // Card state breakdown
  const cardStates = await db
    .select()
    .from(cardStatesTable)
    .where(eq(cardStatesTable.studentId, studentId));

  let cardsLearning = 0;
  let cardsMastered = 0;
  let dueToday = 0;
  cardStates.forEach((s) => {
    if ((s.stability ?? 0) >= 21) cardsMastered++;
    else cardsLearning++;
    if (s.nextReviewAt && new Date(s.nextReviewAt) <= now) dueToday++;
  });

  // Streak: count consecutive days with at least 1 review
  const recentReviews = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.studentId, studentId))
    .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
    .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt}) desc`)
    .limit(30);

  const currentStreak = computeStreak(recentReviews.map((r) => r.day));

  // Retention trend — last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const retentionTrend = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
      retention: sql<number>`cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)`,
      reviewCount: sql<number>`cast(count(${reviewsTable.id}) as int)`,
    })
    .from(reviewsTable)
    .where(and(eq(reviewsTable.studentId, studentId), gte(reviewsTable.reviewedAt, thirtyDaysAgo)))
    .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
    .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`);

  // Per-deck progress
  const deckProgress = await db
    .select({
      deckId: decksTable.id,
      deckName: decksTable.name,
      totalCards: sql<number>`cast(count(distinct ${cardsTable.id}) as int)`,
      mastered: sql<number>`cast(count(distinct case when ${cardStatesTable.stability} >= 21 then ${cardStatesTable.cardId} end) as int)`,
      learning: sql<number>`cast(count(distinct case when ${cardStatesTable.stability} is not null and ${cardStatesTable.stability} < 21 then ${cardStatesTable.cardId} end) as int)`,
      newCards: sql<number>`cast(count(distinct case when ${cardStatesTable.id} is null then ${cardsTable.id} end) as int)`,
      dueToday: sql<number>`cast(count(distinct case when ${cardStatesTable.nextReviewAt} <= now() then ${cardStatesTable.cardId} end) as int)`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0 
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
    })
    .from(decksTable)
    .innerJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .leftJoin(
      cardStatesTable,
      and(eq(cardsTable.id, cardStatesTable.cardId), eq(cardStatesTable.studentId, studentId))
    )
    .leftJoin(
      reviewsTable,
      and(eq(cardsTable.id, reviewsTable.cardId), eq(reviewsTable.studentId, studentId))
    )
    .where(
      sql`${decksTable.id} in (
        select distinct ${cardStatesTable.deckId} from ${cardStatesTable}
        where ${cardStatesTable.studentId} = ${studentId}
      )`
    )
    .groupBy(decksTable.id);

  const mappedDeckProgress = deckProgress.map((d) => ({
    ...d,
    new: d.newCards,
  }));

  res.json(
    GetStudentAnalyticsResponse.parse({
      studentId,
      studentName: student?.name ?? "",
      totalReviews: reviewStats?.totalReviews ?? 0,
      cardsLearning,
      cardsMastered,
      cardsNew: 0,
      averageRetention: reviewStats?.averageRetention ?? null,
      currentStreak,
      retentionTrend,
      deckProgress: mappedDeckProgress,
    })
  );
});

router.get("/analytics/class/:classId/at-risk", async (req, res): Promise<void> => {
  const params = GetAtRiskStudentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { classId } = params.data;
  const now = new Date();

  const students = await db
    .select({
      studentId: usersTable.id,
      studentName: usersTable.name,
      studentEmail: usersTable.email,
      lastReviewedAt: sql<string | null>`max(${reviewsTable.reviewedAt})`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
      cardsOverdue: sql<number>`
        cast(count(distinct case when ${cardStatesTable.nextReviewAt} <= now() then ${cardStatesTable.cardId} end) as int)
      `,
    })
    .from(enrollmentsTable)
    .innerJoin(usersTable, eq(enrollmentsTable.studentId, usersTable.id))
    .leftJoin(reviewsTable, eq(enrollmentsTable.studentId, reviewsTable.studentId))
    .leftJoin(
      cardStatesTable,
      eq(enrollmentsTable.studentId, cardStatesTable.studentId)
    )
    .where(eq(enrollmentsTable.classId, classId))
    .groupBy(usersTable.id)
    .orderBy(usersTable.name);

  const atRisk = students.map((s) => {
    const daysSinceLastReview = s.lastReviewedAt
      ? Math.floor((now.getTime() - new Date(s.lastReviewedAt).getTime()) / 86400000)
      : null;

    let riskLevel: "low" | "medium" | "high" = "low";
    let riskReason = "On track";

    if (daysSinceLastReview === null || daysSinceLastReview > 7) {
      riskLevel = "high";
      riskReason = daysSinceLastReview === null ? "No study activity yet" : `No reviews in ${daysSinceLastReview} days`;
    } else if ((s.averageRetention !== null && s.averageRetention < 0.6) || s.cardsOverdue > 5) {
      riskLevel = "high";
      riskReason = s.cardsOverdue > 5 ? `${s.cardsOverdue} cards overdue` : "Low recall rate";
    } else if ((s.averageRetention !== null && s.averageRetention < 0.75) || s.cardsOverdue > 2 || (daysSinceLastReview ?? 0) > 3) {
      riskLevel = "medium";
      riskReason =
        s.cardsOverdue > 2
          ? `${s.cardsOverdue} cards overdue`
          : (daysSinceLastReview ?? 0) > 3
          ? "Irregular study pattern"
          : "Below average retention";
    }

    return {
      studentId: s.studentId,
      studentName: s.studentName,
      studentEmail: s.studentEmail,
      averageRetention: s.averageRetention,
      daysSinceLastReview,
      cardsOverdue: s.cardsOverdue,
      riskLevel,
      riskReason,
    };
  });

  res.json(GetAtRiskStudentsResponse.parse(atRisk));
});

// ─── Persona endpoint ─────────────────────────────────────────────────────────
router.get("/students/:studentId/persona", async (req, res): Promise<void> => {
  const params = GetStudentPersonaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { studentId } = params.data;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();

  const [existing] = await db
    .select()
    .from(aiPersonasTable)
    .where(eq(aiPersonasTable.studentId, studentId));

  if (existing && now.getTime() - new Date(existing.updatedAt).getTime() < SEVEN_DAYS_MS) {
    res.json(GetStudentPersonaResponse.parse({ ...existing, studentId }));
    return;
  }

  // Gather review stats for the AI call
  const [student] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, studentId));
  const [reviewStats] = await db
    .select({
      totalReviews: sql<number>`cast(count(${reviewsTable.id}) as int)`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0 
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
      avgGrade: sql<number | null>`cast(avg(${reviewsTable.grade}) as double precision)`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.studentId, studentId));

  const cardStateRows = await db
    .select({ stability: cardStatesTable.stability, reviewCount: cardStatesTable.reviewCount })
    .from(cardStatesTable)
    .where(eq(cardStatesTable.studentId, studentId));

  const mastered = cardStateRows.filter((s) => (s.stability ?? 0) >= 21).length;
  const totalStates = cardStateRows.length;
  const avgReviewCount = totalStates > 0 ? cardStateRows.reduce((sum, s) => sum + (s.reviewCount ?? 0), 0) / totalStates : 0;

  const prompt = `You are analyzing a student's spaced repetition learning data to generate a learning persona profile.

Student: ${student?.name ?? "Unknown"}
Total reviews: ${reviewStats?.totalReviews ?? 0}
Average retention: ${reviewStats?.averageRetention !== null ? Math.round((reviewStats?.averageRetention ?? 0) * 100) + "%" : "N/A"}
Average grade (1=Again, 4=Easy): ${reviewStats?.avgGrade?.toFixed(2) ?? "N/A"}
Cards mastered (stability >= 21 days): ${mastered} of ${totalStates}
Average review count per card: ${avgReviewCount.toFixed(1)}

Based on this data, generate a learning persona with the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "personaType": "one of: Sprinter, Marathoner, Deep Diver, Juggler, Perfectionist, Explorer",
  "personaLabel": "a short catchy label like 'The Deep Diver'",
  "personaDescription": "2-3 sentences describing this student's learning style based on the data",
  "gritScore": integer from 1-100 representing persistence and long-term commitment,
  "gritLabel": "short label like 'High Persistence' or 'Building Momentum'",
  "flowState": "one of: in_flow, approaching, warming_up, starting_out",
  "flowLabel": "short label like 'In the Zone' or 'Finding Your Rhythm'"
}`;

  let personaData: {
    personaType: string;
    personaLabel: string;
    personaDescription: string;
    gritScore: number;
    gritLabel: string;
    flowState: string;
    flowLabel: string;
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    personaData = JSON.parse(content);
  } catch {
    personaData = {
      personaType: "Explorer",
      personaLabel: "The Explorer",
      personaDescription: "You're building your learning journey step by step.",
      gritScore: 50,
      gritLabel: "Building Momentum",
      flowState: "warming_up",
      flowLabel: "Finding Your Rhythm",
    };
  }

  // Upsert into ai_personas
  if (existing) {
    await db
      .update(aiPersonasTable)
      .set({
        personaType: personaData.personaType,
        personaLabel: personaData.personaLabel,
        personaDescription: personaData.personaDescription,
        gritScore: personaData.gritScore,
        gritLabel: personaData.gritLabel,
        flowState: personaData.flowState,
        flowLabel: personaData.flowLabel,
        updatedAt: now,
      })
      .where(eq(aiPersonasTable.studentId, studentId));
  } else {
    await db.insert(aiPersonasTable).values({
      studentId,
      personaType: personaData.personaType,
      personaLabel: personaData.personaLabel,
      personaDescription: personaData.personaDescription,
      gritScore: personaData.gritScore,
      gritLabel: personaData.gritLabel,
      flowState: personaData.flowState,
      flowLabel: personaData.flowLabel,
      updatedAt: now,
    });
  }

  res.json(
    GetStudentPersonaResponse.parse({
      studentId,
      personaType: personaData.personaType,
      personaLabel: personaData.personaLabel,
      personaDescription: personaData.personaDescription,
      gritScore: personaData.gritScore,
      gritLabel: personaData.gritLabel,
      flowState: personaData.flowState,
      flowLabel: personaData.flowLabel,
      updatedAt: now,
    })
  );
});

// ─── Study time endpoint ──────────────────────────────────────────────────────
router.get("/students/:studentId/study-time", async (req, res): Promise<void> => {
  const params = GetStudentStudyTimeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { studentId } = params.data;

  // Get start of current ISO week (Monday)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sunday, 1=Monday, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - daysToMonday);
  weekStart.setUTCHours(0, 0, 0, 0);

  const [result] = await db
    .select({
      totalSeconds: sql<number>`cast(coalesce(sum(${studySessionsTable.sessionDurationSeconds}), 0) as int)`,
    })
    .from(studySessionsTable)
    .where(
      and(
        eq(studySessionsTable.studentId, studentId),
        gte(studySessionsTable.startedAt, weekStart),
        isNotNull(studySessionsTable.sessionDurationSeconds)
      )
    );

  const totalSeconds = result?.totalSeconds ?? 0;
  const hoursThisWeek = Math.round((totalSeconds / 3600) * 10) / 10;

  res.json(
    GetStudentStudyTimeResponse.parse({
      studentId,
      hoursThisWeek,
      totalSecondsThisWeek: totalSeconds,
    })
  );
});

// ─── Knowledge graph endpoint ─────────────────────────────────────────────────
router.get("/students/:studentId/knowledge-graph", async (req, res): Promise<void> => {
  const params = GetStudentKnowledgeGraphParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { studentId } = params.data;
  const MASTERY_THRESHOLD = 21;
  const now = new Date();

  // Get all card states for this student with card tags
  const cardStateRows = await db
    .select({
      cardId: cardStatesTable.cardId,
      stability: cardStatesTable.stability,
      nextReviewAt: cardStatesTable.nextReviewAt,
      tags: cardsTable.tags,
    })
    .from(cardStatesTable)
    .innerJoin(cardsTable, eq(cardStatesTable.cardId, cardsTable.id))
    .where(eq(cardStatesTable.studentId, studentId));

  // Group by tag
  const tagMap = new Map<string, { totalCards: number; masteredCards: number; dueCards: number }>();

  for (const row of cardStateRows) {
    const tags = row.tags?.length ? row.tags : ["(untagged)"];
    for (const tag of tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { totalCards: 0, masteredCards: 0, dueCards: 0 });
      }
      const entry = tagMap.get(tag)!;
      entry.totalCards++;
      if ((row.stability ?? 0) >= MASTERY_THRESHOLD) {
        entry.masteredCards++;
      }
      if (row.nextReviewAt && new Date(row.nextReviewAt) <= now) {
        entry.dueCards++;
      }
    }
  }

  const result = Array.from(tagMap.entries()).map(([tag, data]) => ({
    tag,
    totalCards: data.totalCards,
    masteredCards: data.masteredCards,
    dueCards: data.dueCards,
    masteryPercent:
      data.totalCards > 0 ? Math.round((data.masteredCards / data.totalCards) * 100) : 0,
  }));

  // Sort by mastery percent descending
  result.sort((a, b) => b.masteryPercent - a.masteryPercent);

  res.json(GetStudentKnowledgeGraphResponse.parse(result));
});

router.get("/analytics/teacher/:teacherId/students", async (req, res): Promise<void> => {
  const params = GetTeacherStudentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { teacherId } = params.data;
  const now = new Date();

  // Get all classes owned by this teacher
  const teacherClasses = await db
    .select({ id: classesTable.id, name: classesTable.name })
    .from(classesTable)
    .where(eq(classesTable.teacherId, teacherId));

  if (teacherClasses.length === 0) {
    res.json(GetTeacherStudentsResponse.parse([]));
    return;
  }

  const classIds = teacherClasses.map((c) => c.id);

  // Get all students enrolled in any of these classes
  const enrolledStudents = await db
    .select({
      studentId: usersTable.id,
      studentName: usersTable.name,
      studentEmail: usersTable.email,
      classId: enrollmentsTable.classId,
    })
    .from(enrollmentsTable)
    .innerJoin(usersTable, eq(enrollmentsTable.studentId, usersTable.id))
    .where(inArray(enrollmentsTable.classId, classIds));

  // Build a map of studentId -> class names
  const studentClassMap = new Map<number, string[]>();
  for (const e of enrolledStudents) {
    const className = teacherClasses.find((c) => c.id === e.classId)?.name ?? "";
    if (!studentClassMap.has(e.studentId)) {
      studentClassMap.set(e.studentId, []);
    }
    if (className && !studentClassMap.get(e.studentId)!.includes(className)) {
      studentClassMap.get(e.studentId)!.push(className);
    }
  }

  const uniqueStudentIds = [...studentClassMap.keys()];

  if (uniqueStudentIds.length === 0) {
    res.json(GetTeacherStudentsResponse.parse([]));
    return;
  }

  // Get review stats per student (scoped to teacher's cards)
  const reviewStats = await db
    .select({
      studentId: reviewsTable.studentId,
      lastReviewedAt: sql<string | null>`max(${reviewsTable.reviewedAt})`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
    })
    .from(reviewsTable)
    .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(inArray(decksTable.classId, classIds), inArray(reviewsTable.studentId, uniqueStudentIds)))
    .groupBy(reviewsTable.studentId);

  const reviewStatsMap = new Map(reviewStats.map((r) => [r.studentId, r]));

  // Cards due today per student
  const cardsDueRows = await db
    .select({
      studentId: cardStatesTable.studentId,
      dueCount: sql<number>`cast(count(*) as int)`,
    })
    .from(cardStatesTable)
    .innerJoin(cardsTable, eq(cardStatesTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(
      and(
        inArray(decksTable.classId, classIds),
        inArray(cardStatesTable.studentId, uniqueStudentIds),
        sql`${cardStatesTable.nextReviewAt} <= now()`
      )
    )
    .groupBy(cardStatesTable.studentId);

  const cardsDueMap = new Map(cardsDueRows.map((r) => [r.studentId, r.dueCount]));

  // Streak per student: get days with reviews in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const streakRows = await db
    .select({
      studentId: reviewsTable.studentId,
      day: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
    })
    .from(reviewsTable)
    .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(inArray(decksTable.classId, classIds), inArray(reviewsTable.studentId, uniqueStudentIds), gte(reviewsTable.reviewedAt, thirtyDaysAgo)))
    .groupBy(reviewsTable.studentId, sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
    .orderBy(reviewsTable.studentId, sql`date_trunc('day', ${reviewsTable.reviewedAt}) desc`);

  const streakDaysMap = new Map<number, string[]>();
  for (const r of streakRows) {
    if (!streakDaysMap.has(r.studentId)) streakDaysMap.set(r.studentId, []);
    streakDaysMap.get(r.studentId)!.push(r.day);
  }

  // Get existing alerts per student from teacher
  const alertRows = await db
    .select({
      studentId: alertsTable.studentId,
      alertType: alertsTable.alertType,
    })
    .from(alertsTable)
    .where(and(eq(alertsTable.teacherId, teacherId), inArray(alertsTable.studentId, uniqueStudentIds)));

  const alertMap = new Map<number, Set<string>>();
  for (const a of alertRows) {
    if (!alertMap.has(a.studentId)) alertMap.set(a.studentId, new Set());
    alertMap.get(a.studentId)!.add(a.alertType);
  }

  // Build result
  const result = uniqueStudentIds.map((studentId) => {
    const stats = reviewStatsMap.get(studentId);
    const lastActiveAt = stats?.lastReviewedAt ?? null;
    const daysSinceLastReview = lastActiveAt
      ? Math.floor((now.getTime() - new Date(lastActiveAt).getTime()) / 86400000)
      : null;
    const averageRetention = stats?.averageRetention ?? null;
    const cardsDueToday = cardsDueMap.get(studentId) ?? 0;
    const streakDays = streakDaysMap.get(studentId) ?? [];
    const streakCount = computeStreak(streakDays);
    const alerts = alertMap.get(studentId) ?? new Set();

    let riskLevel: "on_track" | "slipping" | "at_risk" = "on_track";
    let riskReason = "On track";

    const hasNoActivityAlert = alerts.has("no_activity");
    const hasLowRetentionAlert = alerts.has("low_retention");
    const hasStrugglingAlert = alerts.has("struggling_concept");

    if (hasNoActivityAlert || daysSinceLastReview === null || daysSinceLastReview > 7) {
      riskLevel = "at_risk";
      riskReason = daysSinceLastReview === null ? "No activity yet" : `No reviews in ${daysSinceLastReview} days`;
    } else if (hasLowRetentionAlert || hasStrugglingAlert || (averageRetention !== null && averageRetention < 0.6) || cardsDueToday > 5) {
      riskLevel = "at_risk";
      riskReason = hasStrugglingAlert ? "Struggling with concepts" : cardsDueToday > 5 ? `${cardsDueToday} cards overdue` : "Low recall rate";
    } else if ((averageRetention !== null && averageRetention < 0.75) || cardsDueToday > 2 || (daysSinceLastReview ?? 0) > 3) {
      riskLevel = "slipping";
      riskReason =
        cardsDueToday > 2
          ? `${cardsDueToday} cards due`
          : (daysSinceLastReview ?? 0) > 3
          ? "Irregular study pattern"
          : "Below average retention";
    }

    const studentInfo = enrolledStudents.find((e) => e.studentId === studentId);

    return {
      studentId,
      studentName: studentInfo?.studentName ?? "",
      studentEmail: studentInfo?.studentEmail ?? "",
      classes: studentClassMap.get(studentId) ?? [],
      averageRetention,
      cardsDueToday,
      lastActiveAt: lastActiveAt ? new Date(lastActiveAt) : null,
      streakCount,
      riskLevel,
      riskReason,
    };
  });

  res.json(GetTeacherStudentsResponse.parse(result));
});

router.get("/analytics/students/:studentId/detail", async (req, res): Promise<void> => {
  const params = GetStudentDetailParams.safeParse(req.params);
  const query = GetStudentDetailQueryParams.safeParse(req.query);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { studentId } = params.data;
  const teacherId = query.success ? query.data.teacherId : undefined;

  // Get student info
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, studentId));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  // Get class IDs relevant to this teacher (if teacherId provided, scope to their classes)
  let relevantClassIds: number[] | null = null;
  let enrolledClassNames: string[] = [];

  if (teacherId) {
    const teacherClasses = await db
      .select({ id: classesTable.id, name: classesTable.name })
      .from(classesTable)
      .innerJoin(enrollmentsTable, eq(classesTable.id, enrollmentsTable.classId))
      .where(and(eq(classesTable.teacherId, teacherId), eq(enrollmentsTable.studentId, studentId)));
    relevantClassIds = teacherClasses.map((c) => c.id);
    enrolledClassNames = teacherClasses.map((c) => c.name);
  } else {
    const allClasses = await db
      .select({ id: classesTable.id, name: classesTable.name })
      .from(classesTable)
      .innerJoin(enrollmentsTable, eq(classesTable.id, enrollmentsTable.classId))
      .where(eq(enrollmentsTable.studentId, studentId));
    enrolledClassNames = allClasses.map((c) => c.name);
  }

  // Get streak
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const streakQuery = db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.studentId, studentId))
    .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
    .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt}) desc`)
    .limit(30);

  const streakDays = await streakQuery;
  const streakCount = computeStreak(streakDays.map((r) => r.day));

  // Last active
  const [lastActiveRow] = await db
    .select({ lastAt: sql<string | null>`max(${reviewsTable.reviewedAt})` })
    .from(reviewsTable)
    .where(eq(reviewsTable.studentId, studentId));

  // Average retention (scoped to relevant class decks if teacher)
  let averageRetention: number | null = null;
  if (relevantClassIds !== null && relevantClassIds.length > 0) {
    const [retRow] = await db
      .select({
        avgRet: sql<number | null>`
          case when count(${reviewsTable.id}) > 0
          then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
          else null end
        `,
      })
      .from(reviewsTable)
      .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(and(eq(reviewsTable.studentId, studentId), inArray(decksTable.classId, relevantClassIds)));
    averageRetention = retRow?.avgRet ?? null;
  } else if (relevantClassIds === null) {
    const [retRow] = await db
      .select({
        avgRet: sql<number | null>`
          case when count(${reviewsTable.id}) > 0
          then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
          else null end
        `,
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.studentId, studentId));
    averageRetention = retRow?.avgRet ?? null;
  }

  // 30-day retention trend
  const retentionTrendQuery =
    relevantClassIds !== null && relevantClassIds.length > 0
      ? db
          .select({
            date: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
            retention: sql<number>`cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)`,
            reviewCount: sql<number>`cast(count(${reviewsTable.id}) as int)`,
          })
          .from(reviewsTable)
          .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
          .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
          .where(and(eq(reviewsTable.studentId, studentId), gte(reviewsTable.reviewedAt, thirtyDaysAgo), inArray(decksTable.classId, relevantClassIds)))
          .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
          .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
      : db
          .select({
            date: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
            retention: sql<number>`cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)`,
            reviewCount: sql<number>`cast(count(${reviewsTable.id}) as int)`,
          })
          .from(reviewsTable)
          .where(and(eq(reviewsTable.studentId, studentId), gte(reviewsTable.reviewedAt, thirtyDaysAgo)))
          .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
          .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`);

  const retentionTrend = await retentionTrendQuery;

  // Per-deck progress
  const deckProgressQuery =
    relevantClassIds !== null && relevantClassIds.length > 0
      ? db
          .select({
            deckId: decksTable.id,
            deckName: decksTable.name,
            totalCards: sql<number>`cast(count(distinct ${cardsTable.id}) as int)`,
            mastered: sql<number>`cast(count(distinct case when ${cardStatesTable.stability} >= 21 then ${cardStatesTable.cardId} end) as int)`,
            learning: sql<number>`cast(count(distinct case when ${cardStatesTable.stability} is not null and ${cardStatesTable.stability} < 21 then ${cardStatesTable.cardId} end) as int)`,
            newCards: sql<number>`cast(count(distinct case when ${cardStatesTable.id} is null then ${cardsTable.id} end) as int)`,
            dueToday: sql<number>`cast(count(distinct case when ${cardStatesTable.nextReviewAt} <= now() then ${cardStatesTable.cardId} end) as int)`,
            averageRetention: sql<number | null>`
              case when count(${reviewsTable.id}) > 0
              then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
              else null end
            `,
          })
          .from(decksTable)
          .innerJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
          .leftJoin(cardStatesTable, and(eq(cardsTable.id, cardStatesTable.cardId), eq(cardStatesTable.studentId, studentId)))
          .leftJoin(reviewsTable, and(eq(cardsTable.id, reviewsTable.cardId), eq(reviewsTable.studentId, studentId)))
          .where(inArray(decksTable.classId, relevantClassIds))
          .groupBy(decksTable.id)
      : db
          .select({
            deckId: decksTable.id,
            deckName: decksTable.name,
            totalCards: sql<number>`cast(count(distinct ${cardsTable.id}) as int)`,
            mastered: sql<number>`cast(count(distinct case when ${cardStatesTable.stability} >= 21 then ${cardStatesTable.cardId} end) as int)`,
            learning: sql<number>`cast(count(distinct case when ${cardStatesTable.stability} is not null and ${cardStatesTable.stability} < 21 then ${cardStatesTable.cardId} end) as int)`,
            newCards: sql<number>`cast(count(distinct case when ${cardStatesTable.id} is null then ${cardsTable.id} end) as int)`,
            dueToday: sql<number>`cast(count(distinct case when ${cardStatesTable.nextReviewAt} <= now() then ${cardStatesTable.cardId} end) as int)`,
            averageRetention: sql<number | null>`
              case when count(${reviewsTable.id}) > 0
              then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
              else null end
            `,
          })
          .from(decksTable)
          .innerJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
          .leftJoin(cardStatesTable, and(eq(cardsTable.id, cardStatesTable.cardId), eq(cardStatesTable.studentId, studentId)))
          .leftJoin(reviewsTable, and(eq(cardsTable.id, reviewsTable.cardId), eq(reviewsTable.studentId, studentId)))
          .where(
            sql`${decksTable.id} in (
              select distinct ${cardStatesTable.deckId} from ${cardStatesTable}
              where ${cardStatesTable.studentId} = ${studentId}
            )`
          )
          .groupBy(decksTable.id);

  const deckProgressRows = await deckProgressQuery;
  const deckProgress = deckProgressRows.map((d) => ({ ...d, new: d.newCards }));

  // Recent reviews (last 20)
  const recentReviewsQuery = db
    .select({
      reviewId: reviewsTable.id,
      cardFront: cardsTable.front,
      deckName: decksTable.name,
      grade: reviewsTable.grade,
      recalled: reviewsTable.recalled,
      reviewedAt: reviewsTable.reviewedAt,
    })
    .from(reviewsTable)
    .innerJoin(cardsTable, eq(reviewsTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(reviewsTable.studentId, studentId))
    .orderBy(sql`${reviewsTable.reviewedAt} desc`)
    .limit(20);

  const recentReviews = await recentReviewsQuery;

  // At-risk flags from alerts table + computed
  const alertRows = await db
    .select({ alertType: alertsTable.alertType, message: alertsTable.message })
    .from(alertsTable)
    .where(eq(alertsTable.studentId, studentId))
    .orderBy(sql`${alertsTable.createdAt} desc`)
    .limit(10);

  const atRiskFlags: string[] = alertRows.map((a) => a.message);

  // Add computed flags if not already covered
  const now = new Date();
  const lastActiveAt = lastActiveRow?.lastAt ? new Date(lastActiveRow.lastAt) : null;
  if (lastActiveAt) {
    const daysSince = Math.floor((now.getTime() - lastActiveAt.getTime()) / 86400000);
    if (daysSince >= 4 && !atRiskFlags.some((f) => f.toLowerCase().includes("review"))) {
      atRiskFlags.push(`Hasn't reviewed in ${daysSince} days`);
    }
  } else {
    atRiskFlags.push("No study activity yet");
  }

  res.json(
    GetStudentDetailResponse.parse({
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      avatarUrl: student.avatarUrl ?? null,
      classes: enrolledClassNames,
      streakCount,
      lastActiveAt: lastActiveAt ?? null,
      averageRetention,
      retentionTrend: retentionTrend.map((p) => ({ ...p, date: new Date(p.date) })),
      deckProgress,
      recentReviews: recentReviews.map((r) => ({
        ...r,
        reviewedAt: new Date(r.reviewedAt),
      })),
      atRiskFlags,
    })
  );
});

export default router;
