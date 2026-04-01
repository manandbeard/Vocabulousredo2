import { Router, type IRouter } from "express";
import { eq, sql, and, desc } from "drizzle-orm";
import {
  db,
  achievementsTable,
  userAchievementsTable,
  reviewsTable,
  classesTable,
  enrollmentsTable,
} from "@workspace/db";
import { checkAndIssueStudentAchievements } from "../lib/check-achievements";

const router: IRouter = Router();

function parseIntParam(value: unknown): number | null {
  const n = parseInt(String(value), 10);
  return isNaN(n) ? null : n;
}

// ─── GET /students/:studentId/achievements ──────────────────────────────────
router.get("/students/:studentId/achievements", async (req, res): Promise<void> => {
  const studentId = parseIntParam(req.params.studentId);
  if (studentId === null) {
    res.status(400).json({ error: "Invalid studentId" });
    return;
  }

  const earned = await db
    .select({
      id: userAchievementsTable.id,
      achievementId: userAchievementsTable.achievementId,
      userId: userAchievementsTable.userId,
      classId: userAchievementsTable.classId,
      earnedAt: userAchievementsTable.earnedAt,
      achievement: {
        id: achievementsTable.id,
        key: achievementsTable.key,
        name: achievementsTable.name,
        description: achievementsTable.description,
        icon: achievementsTable.icon,
        category: achievementsTable.category,
        targetValue: achievementsTable.targetValue,
        createdAt: achievementsTable.createdAt,
      },
    })
    .from(userAchievementsTable)
    .innerJoin(achievementsTable, eq(userAchievementsTable.achievementId, achievementsTable.id))
    .where(
      and(
        eq(userAchievementsTable.userId, studentId),
        sql`${achievementsTable.category} != 'class_milestone'`
      )
    )
    .orderBy(desc(userAchievementsTable.earnedAt));

  const all = await db.select().from(achievementsTable)
    .where(sql`${achievementsTable.category} != 'class_milestone'`);

  const earnedIds = new Set(earned.map((e) => e.achievementId));
  const locked = all.filter((a) => !earnedIds.has(a.id));

  res.json({ earned, locked });
});

// ─── GET /teacher/class/:classId/milestones ─────────────────────────────────
router.get("/teacher/class/:classId/milestones", async (req, res): Promise<void> => {
  const classId = parseIntParam(req.params.classId);
  if (classId === null) {
    res.status(400).json({ error: "Invalid classId" });
    return;
  }

  const milestones = await db
    .select({
      id: userAchievementsTable.id,
      achievementId: userAchievementsTable.achievementId,
      userId: userAchievementsTable.userId,
      classId: userAchievementsTable.classId,
      earnedAt: userAchievementsTable.earnedAt,
      achievement: {
        id: achievementsTable.id,
        key: achievementsTable.key,
        name: achievementsTable.name,
        description: achievementsTable.description,
        icon: achievementsTable.icon,
        category: achievementsTable.category,
        targetValue: achievementsTable.targetValue,
        createdAt: achievementsTable.createdAt,
      },
    })
    .from(userAchievementsTable)
    .innerJoin(achievementsTable, eq(userAchievementsTable.achievementId, achievementsTable.id))
    .where(
      and(
        eq(userAchievementsTable.classId, classId),
        eq(achievementsTable.category, "class_milestone")
      )
    )
    .orderBy(desc(userAchievementsTable.earnedAt));

  res.json(milestones);
});

// ─── POST /students/:studentId/check-achievements ───────────────────────────
router.post("/students/:studentId/check-achievements", async (req, res): Promise<void> => {
  const studentId = parseIntParam(req.params.studentId);
  if (studentId === null) {
    res.status(400).json({ error: "Invalid studentId" });
    return;
  }

  const newlyEarned = await checkAndIssueStudentAchievements(studentId);
  res.json({ newlyEarned });
});

// ─── GET /teacher/:teacherId/milestones ──────────────────────────────────────
router.get("/teacher/:teacherId/milestones", async (req, res): Promise<void> => {
  const teacherId = parseIntParam(req.params.teacherId);
  if (teacherId === null) {
    res.status(400).json({ error: "Invalid teacherId" });
    return;
  }

  const milestones = await db
    .select({
      id: userAchievementsTable.id,
      achievementId: userAchievementsTable.achievementId,
      userId: userAchievementsTable.userId,
      classId: userAchievementsTable.classId,
      earnedAt: userAchievementsTable.earnedAt,
      className: classesTable.name,
      achievement: {
        id: achievementsTable.id,
        key: achievementsTable.key,
        name: achievementsTable.name,
        description: achievementsTable.description,
        icon: achievementsTable.icon,
        category: achievementsTable.category,
        targetValue: achievementsTable.targetValue,
        createdAt: achievementsTable.createdAt,
      },
    })
    .from(userAchievementsTable)
    .innerJoin(achievementsTable, eq(userAchievementsTable.achievementId, achievementsTable.id))
    .innerJoin(classesTable, eq(userAchievementsTable.classId, classesTable.id))
    .where(
      and(
        eq(userAchievementsTable.userId, teacherId),
        eq(achievementsTable.category, "class_milestone")
      )
    )
    .orderBy(desc(userAchievementsTable.earnedAt));

  res.json(milestones);
});

export default router;
