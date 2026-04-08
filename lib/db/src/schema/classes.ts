import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  teacherId: integer("teacher_id").notNull().references(() => usersTable.id),
  icon: text("icon"),
  colorScheme: text("color_scheme"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("classes_teacher_id_idx").on(t.teacherId),
]);

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classesTable.id),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // Analytics: students in a class; enrollment lookups
  index("enrollments_class_id_idx").on(t.classId),
  index("enrollments_student_id_idx").on(t.studentId),
  // Common join pattern in at-risk and analytics queries
  index("enrollments_class_student_idx").on(t.classId, t.studentId),
]);

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classesTable.$inferSelect;

export const insertEnrollmentSchema = createInsertSchema(enrollmentsTable).omit({ id: true, enrolledAt: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollmentsTable.$inferSelect;
