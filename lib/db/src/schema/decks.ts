import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { classesTable } from "./classes";

export const decksTable = pgTable("decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  classId: integer("class_id").references(() => classesTable.id),
  teacherId: integer("teacher_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDeckSchema = createInsertSchema(decksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type Deck = typeof decksTable.$inferSelect;
