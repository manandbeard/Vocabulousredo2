import { Router, type IRouter } from "express";
import { eq, sql, and, gte, isNotNull } from "drizzle-orm";
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

export default router;
