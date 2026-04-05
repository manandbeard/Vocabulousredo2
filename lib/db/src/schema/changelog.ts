import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const changelogEntriesTable = pgTable("changelog_entries", {
  id: serial("id").primaryKey(),
  taskNumber: serial("task_number").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().$type<"pending" | "in-progress" | "shipped">().default("pending"),
  whatAndWhy: text("what_and_why").notNull(),
  doneLooksLike: text("done_looks_like").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChangelogEntrySchema = createInsertSchema(changelogEntriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChangelogEntry = z.infer<typeof insertChangelogEntrySchema>;
export type ChangelogEntry = typeof changelogEntriesTable.$inferSelect;
