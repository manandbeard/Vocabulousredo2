import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const aiPersonasTable = pgTable("ai_personas", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique().references(() => usersTable.id),
  personaType: text("persona_type").notNull(),
  personaLabel: text("persona_label").notNull(),
  personaDescription: text("persona_description").notNull(),
  gritScore: integer("grit_score"),
  gritLabel: text("grit_label"),
  flowState: text("flow_state"),
  flowLabel: text("flow_label"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAiPersonaSchema = createInsertSchema(aiPersonasTable).omit({ id: true });
export type InsertAiPersona = z.infer<typeof insertAiPersonaSchema>;
export type AiPersona = typeof aiPersonasTable.$inferSelect;
