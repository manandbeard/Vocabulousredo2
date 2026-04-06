import { pgTable, serial, timestamp, integer, real, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { cardsTable } from "./cards";
import { decksTable } from "./decks";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  cardId: integer("card_id").notNull().references(() => cardsTable.id),
  deckId: integer("deck_id").notNull().references(() => decksTable.id),
  grade: integer("grade").notNull(), // 1=Again, 2=Hard, 3=Good, 4=Easy
  recalled: boolean("recalled").notNull(),
  elapsedDays: real("elapsed_days").notNull().default(0),
  stabilityBefore: real("stability_before"),
  stabilityAfter: real("stability_after"),
  difficultyAfter: real("difficulty_after"),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }).notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
});

// Per-card SRS state per student (ts-fsrs Card model)
export const cardStatesTable = pgTable("card_states", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  cardId: integer("card_id").notNull().references(() => cardsTable.id),
  deckId: integer("deck_id").notNull().references(() => decksTable.id),
  stability: real("stability").notNull().default(0),
  difficulty: real("difficulty").notNull().default(0),
  // FSRS card state: "New" | "Learning" | "Review" | "Relearning"
  fsrsState: text("fsrs_state").notNull().default("New"),
  lapses: integer("lapses").notNull().default(0),
  scheduledDays: real("scheduled_days").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, reviewedAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
export type CardState = typeof cardStatesTable.$inferSelect;
