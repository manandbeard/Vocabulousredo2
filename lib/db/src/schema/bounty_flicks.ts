/**
 * Bounty Flicks — peer-to-peer concept challenges
 *
 * A "Bounty" is when Student A (Challenger) flicks a difficult concept
 * to Student B (Defender) using their COPPA-safe alias.
 *
 * Outcome rewards:
 *   Defender recalls correctly  → earns a cosmetic "dupe" (copy of a cosmetic)
 *   Challenger posted a bounty  → earns a "Tutor Bonus" (extra points)
 */

import { pgTable, serial, integer, timestamp, text, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { conceptsTable } from "./concepts";

export const BOUNTY_STATUS = ["pending", "accepted", "completed", "expired"] as const;
export type BountyStatus = (typeof BOUNTY_STATUS)[number];

export const bountyFlicksTable = pgTable("bounty_flicks", {
  id: serial("id").primaryKey(),
  /** Student who sent the bounty */
  challengerId: integer("challenger_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  /** Student who received the bounty */
  defenderId: integer("defender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  /** The concept being challenged */
  conceptId: integer("concept_id").notNull().references(() => conceptsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<BountyStatus>().default("pending"),
  /** Whether the defender answered correctly */
  defenderRecalled: boolean("defender_recalled"),
  /** Cosmetic item ID awarded to the defender on success */
  defenderReward: text("defender_reward"),
  /** Points awarded to the challenger (Tutor Bonus) */
  challengerBonusPoints: integer("challenger_bonus_points").notNull().default(0),
  /** When the bounty expires if not accepted */
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => [
  // Load incoming bounties for a defender
  index("bounty_flicks_defender_status_idx").on(t.defenderId, t.status),
  // Load outgoing bounties for a challenger
  index("bounty_flicks_challenger_idx").on(t.challengerId),
]);

export const insertBountyFlickSchema = createInsertSchema(bountyFlicksTable).omit({ id: true, createdAt: true });
export type InsertBountyFlick = z.infer<typeof insertBountyFlickSchema>;
export type BountyFlick = typeof bountyFlicksTable.$inferSelect;
