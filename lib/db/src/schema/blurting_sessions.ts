import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { decksTable } from "./decks";

export const blurtingSessionsTable = pgTable("blurting_sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  deckId: integer("deck_id").references(() => decksTable.id),
  prompt: text("prompt").notNull(),
  studentResponse: text("student_response").notNull(),
  aiScore: integer("ai_score"),
  aiFeedback: text("ai_feedback"),
  rubric: text("rubric"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlurtingSessionSchema = createInsertSchema(blurtingSessionsTable).omit({ id: true });
export type InsertBlurtingSession = z.infer<typeof insertBlurtingSessionSchema>;
export type BlurtingSession = typeof blurtingSessionsTable.$inferSelect;
