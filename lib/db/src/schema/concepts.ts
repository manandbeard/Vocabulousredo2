/**
 * Concepts table — rich content cards that replace the simple flashcard model.
 *
 * content_payload is a JSONB blob that supports mixed-media cards:
 *   { "text": "...", "image_url": "...", "audio_url": "...", "sequence": [...] }
 *
 * card_type determines the interaction modality:
 *   recall    — classic front/back flashcard
 *   poll      — multiple-choice poll with no correct answer (opinion)
 *   hotspot   — image with tappable regions
 *   sequence  — drag-to-reorder items (Coyote Time applies on mis-sorts)
 */

import { pgTable, text, serial, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const CARD_TYPES = ["recall", "poll", "hotspot", "sequence"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const conceptsTable = pgTable("concepts", {
  id: serial("id").primaryKey(),
  /** Teacher who created this concept */
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  /**
   * Mixed-media content payload. Shape varies by card_type:
   *   recall:   { front: string, back: string, hint?: string }
   *   poll:     { question: string, options: string[] }
   *   hotspot:  { image_url: string, regions: HotspotRegion[] }
   *   sequence: { prompt: string, items: string[] }
   */
  contentPayload: jsonb("content_payload").notNull().$type<Record<string, unknown>>(),
  cardType: text("card_type").notNull().$type<CardType>().default("recall"),
  /** Comma-separated subject tags for curriculum graph nodes */
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("concepts_created_by_idx").on(t.createdBy),
  index("concepts_card_type_idx").on(t.cardType),
]);

export const insertConceptSchema = createInsertSchema(conceptsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof conceptsTable.$inferSelect;
