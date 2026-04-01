import { db } from "@workspace/db";
import { achievementsTable } from "@workspace/db";

const studentAchievements = [
  {
    key: "streak_7",
    name: "7-Day Scholar",
    description: "Maintained a 7-day review streak",
    icon: "🔥",
    category: "streak" as const,
    targetValue: 7,
  },
  {
    key: "streak_30",
    name: "30-Day Scholar",
    description: "Maintained a 30-day review streak",
    icon: "🏆",
    category: "streak" as const,
    targetValue: 30,
  },
  {
    key: "reviews_100",
    name: "Century Reviewer",
    description: "Completed 100 card reviews",
    icon: "💯",
    category: "reviews" as const,
    targetValue: 100,
  },
  {
    key: "reviews_500",
    name: "500 Reviews",
    description: "Completed 500 card reviews",
    icon: "⭐",
    category: "reviews" as const,
    targetValue: 500,
  },
  {
    key: "reviews_1000",
    name: "Review Master",
    description: "Completed 1,000 card reviews",
    icon: "🎯",
    category: "reviews" as const,
    targetValue: 1000,
  },
  {
    key: "retention_80",
    name: "Retention Master",
    description: "Achieved 80%+ average retention",
    icon: "🧠",
    category: "retention" as const,
    targetValue: 80,
  },
];

const classMilestones = [
  {
    key: "class_reviews_100",
    name: "Class Century",
    description: "Class completed 100 reviews",
    icon: "🎉",
    category: "class_milestone" as const,
    targetValue: 100,
  },
  {
    key: "class_reviews_500",
    name: "Class 500",
    description: "Class completed 500 reviews",
    icon: "🚀",
    category: "class_milestone" as const,
    targetValue: 500,
  },
  {
    key: "class_reviews_1000",
    name: "Class Milestone 1K",
    description: "Class completed 1,000 reviews",
    icon: "🏅",
    category: "class_milestone" as const,
    targetValue: 1000,
  },
];

async function seed() {
  try {
    console.log("Seeding achievements...");

    for (const achievement of [...studentAchievements, ...classMilestones]) {
      await db
        .insert(achievementsTable)
        .values(achievement)
        .onConflictDoNothing();
      console.log(`✓ Seeded: ${achievement.name}`);
    }

    console.log("✓ Achievement seed complete!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
