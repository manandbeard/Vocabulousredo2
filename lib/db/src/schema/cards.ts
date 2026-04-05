import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { decksTable } from "./decks";
import { usersTable } from "./users";

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull().references(() => decksTable.id),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  hint: text("hint"),
  tags: text("tags").array().notNull().default([]),
  cardType: text("card_type").notNull().$type<"flashcard" | "multiple_choice" | "brain_dump">().default("flashcard"),
  imageUrl: text("image_url"),
  mcOptions: text("mc_options").array(),
  mcCorrectIndex: integer("mc_correct_index"),
  importance: integer("importance").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
