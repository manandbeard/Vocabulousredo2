import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { classesTable } from "./classes";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => usersTable.id),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  classId: integer("class_id").references(() => classesTable.id),
  alertType: text("alert_type").notNull().$type<"at_risk" | "overdue" | "low_retention" | "streak_broken" | "streak" | "achievement" | "review_due" | "class_update">(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
