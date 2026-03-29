import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const changelogEntriesTable = pgTable("changelog_entries", {
  id: serial("id").primaryKey(),
  taskNumber: serial("task_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in-progress, shipped
  whatAndWhy: text("what_and_why").notNull(),
  doneLooksLike: text("done_looks_like").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ChangelogEntry = typeof changelogEntriesTable.$inferSelect;
export type InsertChangelogEntry = typeof changelogEntriesTable.$inferInsert;
