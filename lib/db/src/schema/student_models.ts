import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

// FSRS-6 default parameters (w0–w20) used when no personalized model exists
export const FSRS6_DEFAULT_PARAMS: number[] = [
  0.40255, 1.18385, 3.1262, 15.4722, // w0-w3: initial stability for grades 1-4
  7.2102,                              // w4: initial difficulty
  0.5316,                              // w5: mean reversion weight
  1.0651,                              // w6: difficulty delta scale
  0.06957,                             // w7: (reserved)
  1.58,                                // w8: success stability growth base
  0.1544,                              // w9: success stability decay exponent
  1.0038,                              // w10: success retrievability boost
  1.9395,                              // w11: lapse stability multiplier
  0.11,                                // w12: lapse difficulty exponent
  0.29605,                             // w13: lapse stability growth exponent
  2.2698,                              // w14: lapse retrievability exponent
  0.2315,                              // w15: hard grade stability modifier
  2.9898,                              // w16: easy grade stability modifier
  0.51655,                             // w17: (reserved)
  0.6621,                              // w18: (reserved)
  0.1,                                 // w19: (reserved)
  0.4665,                              // w20: power-law exponent for R(t,S) — FSRS-6 population default
];

// Per-student personalized FSRS-6 parameters, updated via Reptile meta-learning
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
