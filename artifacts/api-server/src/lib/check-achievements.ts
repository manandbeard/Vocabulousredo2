import { eq, sql, and } from "drizzle-orm";
import {
  db,
  achievementsTable,
  userAchievementsTable,
  reviewsTable,
  cardStatesTable,
  enrollmentsTable,
  classesTable,
  decksTable,
} from "@workspace/db";
import { computeStreak } from "./streak";

export async function checkAndIssueStudentAchievements(studentId: number): Promise<string[]> {
  const newlyEarned: string[] = [];

  const alreadyEarned = await db
    .select({ achievementId: userAchievementsTable.achievementId })
    .from(userAchievementsTable)
    .where(eq(userAchievementsTable.userId, studentId));
  const alreadyEarnedIds = new Set(alreadyEarned.map((e) => e.achievementId));

  const allAchievements = await db
    .select()
    .from(achievementsTable)
    .where(sql`${achievementsTable.category} != 'class_milestone'`);

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

  const recentReviews = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${reviewsTable.reviewedAt}), 'YYYY-MM-DD')`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.studentId, studentId))
    .groupBy(sql`date_trunc('day', ${reviewsTable.reviewedAt})`)
    .orderBy(sql`date_trunc('day', ${reviewsTable.reviewedAt}) desc`)
    .limit(35);

  const currentStreak = computeStreak(recentReviews.map((r) => r.day));

  const totalReviews = reviewStats?.totalReviews ?? 0;
  const retention = reviewStats?.averageRetention;

  for (const achievement of allAchievements) {
    if (alreadyEarnedIds.has(achievement.id)) continue;
    let earned = false;
    if (achievement.category === "streak" && achievement.targetValue !== null) {
      earned = currentStreak >= achievement.targetValue;
    } else if (achievement.category === "reviews" && achievement.targetValue !== null) {
      earned = totalReviews >= achievement.targetValue;
    } else if (achievement.category === "retention" && achievement.targetValue !== null) {
      earned = retention !== null && retention * 100 >= achievement.targetValue;
    }
    if (earned) {
      await db.insert(userAchievementsTable).values({ userId: studentId, achievementId: achievement.id });
      newlyEarned.push(achievement.name);
    }
  }

  // Class milestones
  const enrollments = await db
    .select({ classId: enrollmentsTable.classId })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.studentId, studentId));

  const classMilestones = await db
    .select()
    .from(achievementsTable)
    .where(eq(achievementsTable.category, "class_milestone"));

  for (const enrollment of enrollments) {
    const { classId } = enrollment;
    const [classReviewCount] = await db
      .select({
        totalReviews: sql<number>`cast(count(${reviewsTable.id}) as int)`,
      })
      .from(reviewsTable)
      .innerJoin(enrollmentsTable, and(
        eq(reviewsTable.studentId, enrollmentsTable.studentId),
        eq(enrollmentsTable.classId, classId)
      ))
      .innerJoin(decksTable, and(
        eq(reviewsTable.deckId, decksTable.id),
        eq(decksTable.classId, classId)
      ));

    const classTotal = classReviewCount?.totalReviews ?? 0;

    for (const milestone of classMilestones) {
      if (milestone.targetValue === null) continue;
      const [existing] = await db
        .select()
        .from(userAchievementsTable)
        .where(and(
          eq(userAchievementsTable.achievementId, milestone.id),
          eq(userAchievementsTable.classId, classId)
        ))
        .limit(1);

      if (!existing && classTotal >= milestone.targetValue) {
        const [cls] = await db
          .select({ teacherId: classesTable.teacherId })
          .from(classesTable)
          .where(eq(classesTable.id, classId));
        if (cls) {
          await db.insert(userAchievementsTable).values({
            userId: cls.teacherId,
            achievementId: milestone.id,
            classId,
          });
          newlyEarned.push(`${milestone.name} (Class #${classId})`);
        }
      }
    }
  }

  return newlyEarned;
}
