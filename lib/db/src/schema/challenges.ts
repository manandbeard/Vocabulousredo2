/**
 * Challenges table — per-student FSRS state for each concept.
 *
 * Replaces the (card_states + reviews) dual-table approach with a single
 * flat table that exactly mirrors the ts-fsrs `Card` model fields, making
 * Supabase/Deno Edge Function integration straightforward.
 *
 * Required columns (per the product spec):
 *   id, student_id, concept_id, state, due_at, stability, difficulty,
 *   elapsed_days, scheduled_days, reps, lapses, last_review_at
 */

import { pgTable, serial, integer, real, timestamp, text, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { conceptsTable } from "./concepts";

export const FSRS_STATES = ["New", "Learning", "Review", "Relearning"] as const;
export type FsrsState = (typeof FSRS_STATES)[number];

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  /** The student whose learning state this row tracks */
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  /** The concept being learned */
  conceptId: integer("concept_id").notNull().references(() => conceptsTable.id, { onDelete: "cascade" }),
  /** ts-fsrs Card.state: "New" | "Learning" | "Review" | "Relearning" */
  state: text("state").notNull().$type<FsrsState>().default("New"),
  /** When this card is next due for review */
  dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
  /** FSRS memory stability (days) */
  stability: real("stability").notNull().default(0),
  /** FSRS item difficulty (0-1) */
  difficulty: real("difficulty").notNull().default(0),
  /** Days elapsed since the previous review (used by the FSRS scheduler) */
  elapsedDays: real("elapsed_days").notNull().default(0),
  /** Days scheduled until next review */
  scheduledDays: real("scheduled_days").notNull().default(0),
  /** Number of successful reviews */
  reps: integer("reps").notNull().default(0),
  /** Number of lapses (forgotten after being in Review state) */
  lapses: integer("lapses").notNull().default(0),
  /** When the student last reviewed this concept */
  lastReviewAt: timestamp("last_review_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  // Hot path: load all challenges due for a student
  index("challenges_student_due_idx").on(t.studentId, t.dueAt),
  // Lookup a specific student+concept state
  index("challenges_student_concept_idx").on(t.studentId, t.conceptId),
]);

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true, updatedAt: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
