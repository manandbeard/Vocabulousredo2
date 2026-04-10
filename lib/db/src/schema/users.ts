import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
