import { Router } from "express";
import { db } from "@workspace/db";
import { changelogEntriesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// In-memory cache for changelog (60 second TTL)
let changelogCache: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 60 seconds

const isAdmin = (req: any) => {
  const user = req.user?.name || "Anonymous";
  return user === "Nathan Helland";
};

// GET /api/changelog - Public endpoint with 60s server-side cache
router.get("/", async (req, res) => {
  try {
    const now = Date.now();
    
    if (changelogCache && now - cacheTimestamp < CACHE_TTL) {
      return res.json(changelogCache);
    }

    const entries = await db.select().from(changelogEntriesTable).orderBy(changelogEntriesTable.taskNumber);
    
    changelogCache = entries;
    cacheTimestamp = now;
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch changelog" });
  }
});

// POST /api/changelog - Create new entry (admin only)
router.post("/", async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, status, whatAndWhy, doneLooksLike } = req.body;

    if (!title || !status || !whatAndWhy || !doneLooksLike) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["pending", "in-progress", "shipped"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await db
      .insert(changelogEntriesTable)
      .values({
        title,
        status,
        whatAndWhy,
        doneLooksLike,
        taskNumber: Date.now(),
      })
      .returning();

    changelogCache = null;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to create changelog entry" });
  }
});

// PUT /api/changelog/:id - Update entry (admin only)
router.put("/:id", async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const { title, status, whatAndWhy, doneLooksLike } = req.body;

    if (status && !["pending", "in-progress", "shipped"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (status) updateData.status = status;
    if (whatAndWhy) updateData.whatAndWhy = whatAndWhy;
    if (doneLooksLike) updateData.doneLooksLike = doneLooksLike;
    updateData.updatedAt = new Date();

    const result = await db
      .update(changelogEntriesTable)
      .set(updateData)
      .where(eq(changelogEntriesTable.id, id))
      .returning();

    changelogCache = null;
    res.json(result[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to update changelog entry" });
  }
});

// DELETE /api/changelog/:id - Delete entry (admin only)
router.delete("/:id", async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    
    await db
      .delete(changelogEntriesTable)
      .where(eq(changelogEntriesTable.id, id));

    changelogCache = null; // Invalidate cache
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete changelog entry" });
  }
});

export default router;
