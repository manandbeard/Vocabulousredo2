import { db } from "@workspace/db";
import { changelogEntriesTable } from "@workspace/db/schema";

const seedData = [
  {
    title: "Initial Repo Setup",
    status: "shipped" as const,
    whatAndWhy:
      "Set up the foundational project structure with Next.js, TypeScript, PostgreSQL, and API scaffolding. This provides the baseline for all future development.",
    doneLooksLike:
      "Project compiles without errors, database connection established, basic CRUD API endpoints working.",
    taskNumber: 1,
  },
  {
    title: "Python Scheduler API",
    status: "shipped" as const,
    whatAndWhy:
      "Implement the spaced repetition scheduling algorithm using Python. This is the mathematical heart of Vocabulous, calculating optimal review times based on student performance.",
    doneLooksLike:
      "Scheduler API returns next review dates, integration tests pass, accuracy within 99% of research standards.",
    taskNumber: 2,
  },
  {
    title: "Auth Integration",
    status: "shipped" as const,
    whatAndWhy:
      "Add user authentication for teachers and students. Secure role-based access control to protect user data and enforce permissions.",
    doneLooksLike:
      "Users can sign up and log in, JWT tokens issued and validated, role-based routes protected.",
    taskNumber: 3,
  },
  {
    title: "Postgres Schema Design",
    status: "shipped" as const,
    whatAndWhy:
      "Design the relational schema for users, classes, decks, flashcards, and reviews. This is the foundation for all data persistence and analytics.",
    doneLooksLike:
      "Schema normalized to 3NF, foreign keys defined, indexes optimized for common queries, migrations applied successfully.",
    taskNumber: 4,
  },
  {
    title: "Neo-Brutalism Theme Engine",
    status: "shipped" as const,
    whatAndWhy:
      "Build the visual identity of Vocabulous using Neo-Brutalist design principles. Create a cohesive, high-contrast aesthetic that appeals to the Gen-Z audience.",
    doneLooksLike:
      "Design system documented, Tailwind config finalized, all UI components themed, design tokens consistent across the app.",
    taskNumber: 5,
  },
];

async function seed() {
  try {
    console.log("Seeding changelog entries...");
    
    for (const entry of seedData) {
      const result = await db
        .insert(changelogEntriesTable)
        .values(entry)
        .returning();
      console.log(`✓ Created: ${result[0].title}`);
    }

    console.log("✓ Seed complete!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
