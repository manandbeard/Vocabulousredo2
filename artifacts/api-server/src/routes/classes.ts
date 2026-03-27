import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, classesTable, enrollmentsTable, usersTable, reviewsTable, cardStatesTable } from "@workspace/db";
import {
  ListClassesQueryParams,
  ListClassesResponse,
  CreateClassBody,
  GetClassParams,
  GetClassResponse,
  UpdateClassParams,
  UpdateClassBody,
  UpdateClassResponse,
  DeleteClassParams,
  EnrollStudentParams,
  EnrollStudentBody,
  ListClassStudentsParams,
  ListClassStudentsResponse,
  ListStudentClassesParams,
  ListStudentClassesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/classes", async (req, res): Promise<void> => {
  const query = ListClassesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const classes = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      description: classesTable.description,
      subject: classesTable.subject,
      teacherId: classesTable.teacherId,
      teacherName: usersTable.name,
      createdAt: classesTable.createdAt,
      enrollmentCount: sql<number>`cast(count(distinct ${enrollmentsTable.id}) as int)`,
      deckCount: sql<number>`0`,
    })
    .from(classesTable)
    .leftJoin(usersTable, eq(classesTable.teacherId, usersTable.id))
    .leftJoin(enrollmentsTable, eq(classesTable.id, enrollmentsTable.classId))
    .where(query.data.teacherId ? eq(classesTable.teacherId, query.data.teacherId) : undefined)
    .groupBy(classesTable.id, usersTable.name)
    .orderBy(classesTable.createdAt);

  res.json(ListClassesResponse.parse(classes));
});

router.post("/classes", async (req, res): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cls] = await db.insert(classesTable).values(parsed.data).returning();
  const result = { ...cls, teacherName: null, enrollmentCount: 0, deckCount: 0 };
  res.status(201).json(GetClassResponse.parse(result));
});

router.get("/classes/:id", async (req, res): Promise<void> => {
  const params = GetClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [cls] = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      description: classesTable.description,
      subject: classesTable.subject,
      teacherId: classesTable.teacherId,
      teacherName: usersTable.name,
      createdAt: classesTable.createdAt,
      enrollmentCount: sql<number>`cast(count(distinct ${enrollmentsTable.id}) as int)`,
      deckCount: sql<number>`0`,
    })
    .from(classesTable)
    .leftJoin(usersTable, eq(classesTable.teacherId, usersTable.id))
    .leftJoin(enrollmentsTable, eq(classesTable.id, enrollmentsTable.classId))
    .where(eq(classesTable.id, params.data.id))
    .groupBy(classesTable.id, usersTable.name);

  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }
  res.json(GetClassResponse.parse(cls));
});

router.patch("/classes/:id", async (req, res): Promise<void> => {
  const params = UpdateClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cls] = await db
    .update(classesTable)
    .set(parsed.data)
    .where(eq(classesTable.id, params.data.id))
    .returning();
  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }
  const result = { ...cls, teacherName: null, enrollmentCount: 0, deckCount: 0 };
  res.json(UpdateClassResponse.parse(result));
});

router.delete("/classes/:id", async (req, res): Promise<void> => {
  const params = DeleteClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [cls] = await db.delete(classesTable).where(eq(classesTable.id, params.data.id)).returning();
  if (!cls) {
    res.status(404).json({ error: "Class not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/classes/:id/enroll", async (req, res): Promise<void> => {
  const params = EnrollStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = EnrollStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [enrollment] = await db
    .insert(enrollmentsTable)
    .values({ classId: params.data.id, studentId: parsed.data.studentId })
    .returning();
  res.status(201).json(enrollment);
});

router.get("/classes/:id/students", async (req, res): Promise<void> => {
  const params = ListClassStudentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const students = await db
    .select({
      studentId: usersTable.id,
      studentName: usersTable.name,
      studentEmail: usersTable.email,
      enrolledAt: enrollmentsTable.enrolledAt,
      totalReviews: sql<number>`cast(count(distinct ${reviewsTable.id}) as int)`,
      averageRetention: sql<number | null>`
        case when count(${reviewsTable.id}) > 0 
        then cast(avg(case when ${reviewsTable.recalled} then 1.0 else 0.0 end) as double precision)
        else null end
      `,
      lastReviewedAt: sql<Date | null>`max(${reviewsTable.reviewedAt})`,
    })
    .from(enrollmentsTable)
    .innerJoin(usersTable, eq(enrollmentsTable.studentId, usersTable.id))
    .leftJoin(reviewsTable, eq(enrollmentsTable.studentId, reviewsTable.studentId))
    .where(eq(enrollmentsTable.classId, params.data.id))
    .groupBy(usersTable.id, enrollmentsTable.enrolledAt)
    .orderBy(usersTable.name);

  res.json(ListClassStudentsResponse.parse(students));
});

router.get("/students/:studentId/classes", async (req, res): Promise<void> => {
  const params = ListStudentClassesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const classes = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      description: classesTable.description,
      subject: classesTable.subject,
      teacherId: classesTable.teacherId,
      teacherName: usersTable.name,
      createdAt: classesTable.createdAt,
      enrollmentCount: sql<number>`cast(count(distinct ${enrollmentsTable.id}) as int)`,
      deckCount: sql<number>`0`,
    })
    .from(enrollmentsTable)
    .innerJoin(classesTable, eq(enrollmentsTable.classId, classesTable.id))
    .leftJoin(usersTable, eq(classesTable.teacherId, usersTable.id))
    .leftJoin(
      db.select({ classId: enrollmentsTable.classId, cnt: sql<number>`count(*)` })
        .from(enrollmentsTable)
        .groupBy(enrollmentsTable.classId)
        .as("enroll_counts"),
      sql`enroll_counts.class_id = ${classesTable.id}`
    )
    .where(eq(enrollmentsTable.studentId, params.data.studentId))
    .groupBy(classesTable.id, usersTable.name);

  res.json(ListStudentClassesResponse.parse(classes));
});

export default router;
