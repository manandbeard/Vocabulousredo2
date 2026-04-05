import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const studentModelsTable = pgTable("student_models", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique().references(() => usersTable.id),
  modelWeights: text("model_weights").notNull(),
  adaptationPhase: integer("adaptation_phase").notNull().default(1),
  totalReviews: integer("total_reviews").notNull().default(0),
  lastAdaptedAt: timestamp("last_adapted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentModelSchema = createInsertSchema(studentModelsTable).omit({ id: true, updatedAt: true });
export type InsertStudentModel = z.infer<typeof insertStudentModelSchema>;
export type StudentModel = typeof studentModelsTable.$inferSelect;
