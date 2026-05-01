import { pgTable, text, serial, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** COPPA-safe alias shown to peers (e.g. "NEONFALCON"). Always uppercase. Auto-generated on signup. */
  alias: text("alias").unique(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type<"teacher" | "student">(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  streakCount: integer("streak_count").notNull().default(0),
  lastStudyDate: timestamp("last_study_date", { withTimezone: true }),
  schoolName: text("school_name"),
  gradeLevel: text("grade_level"),
  subject: text("subject"),
  bio: text("bio"),
  dailyGoal: integer("daily_goal").notNull().default(20),
  difficultyLevel: text("difficulty_level").notNull().default("Intermediate"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(false),
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  /**
   * Memory Bank: lifetime accumulated points (append-only, never decreases).
   * Prevents loss-aversion burnout.
   */
  memoryBankPoints: integer("memory_bank_points").notNull().default(0),
  /** Points spent on cosmetics (used to compute spendable balance). */
  memoryBankSpent: integer("memory_bank_spent").notNull().default(0),
  /**
   * JSONB blob of equipped cosmetic IDs, e.g.:
   *   { "avatar_frame": "neon_hex", "card_back": "galaxy", "badge": "crown_gold" }
   */
  equippedCosmetics: jsonb("equipped_cosmetics").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("users_alias_idx").on(t.alias),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
