import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { classesTable } from "./classes";

export const achievementsTable = pgTable("achievements", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull().$type<"streak" | "reviews" | "retention" | "class_milestone">(),
  targetValue: integer("target_value"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userAchievementsTable = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  achievementId: integer("achievement_id").notNull().references(() => achievementsTable.id),
  classId: integer("class_id").references(() => classesTable.id),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievementsTable).omit({ id: true, createdAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievementsTable).omit({ id: true, earnedAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type Achievement = typeof achievementsTable.$inferSelect;
export type UserAchievement = typeof userAchievementsTable.$inferSelect;

export const AchievementSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(["streak", "reviews", "retention", "class_milestone"]),
  targetValue: z.number().nullable(),
  createdAt: z.coerce.date(),
});

export const UserAchievementWithDetailsSchema = z.object({
  id: z.number(),
  achievementId: z.number(),
  userId: z.number(),
  classId: z.number().nullable(),
  earnedAt: z.coerce.date(),
  achievement: AchievementSchema,
});

export type UserAchievementWithDetails = z.infer<typeof UserAchievementWithDetailsSchema>;
