import { pgTable, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { decksTable } from "./decks";

export const studySessionsTable = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  deckId: integer("deck_id").references(() => decksTable.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  cardsReviewed: integer("cards_reviewed").notNull().default(0),
  sessionDurationSeconds: integer("session_duration_seconds"),
}, (t) => [
  index("study_sessions_student_id_idx").on(t.studentId),
]);

export const insertStudySessionSchema = createInsertSchema(studySessionsTable).omit({ id: true });
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessionsTable.$inferSelect;
