/**
 * Auth routes:
 *   GET  /api/auth/me              — return the current user's DB record (creates it on first visit)
 *   POST /api/auth/sync-user       — explicitly sync a Clerk user to DB (called after signup with role)
 */
import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { syncClerkUser } from "../middlewares/auth";
import type { Role } from "../middlewares/auth";

const router: IRouter = Router();

// ── GET /auth/me ──────────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's profile from our DB.
 * The client calls this on app load to hydrate the auth context.
 * Returns 401 when not signed in; 404 when signed in but no DB record yet
 * (the client should redirect to role-selection / onboarding).
 */
router.get("/auth/me", async (req, res): Promise<void> => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.googleId, clerkId));

  if (!user) {
    // Signed in with Clerk but hasn't chosen a role yet
    res.status(404).json({ error: "Profile not found", clerkId });
    return;
  }

  // Never expose the password hash
  const { passwordHash: _omit, ...safeUser } = user;
  res.json(safeUser);
});

// ── POST /auth/sync-user ──────────────────────────────────────────────────────
/**
 * Called after a user completes signup and selects their role.
 * Body: { role: "teacher" | "student" }
 * Creates (or updates) the user's record in our DB and returns it.
 */
router.post("/auth/sync-user", async (req, res): Promise<void> => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { role } = req.body as { role?: unknown };
  if (role !== "teacher" && role !== "student") {
    res.status(400).json({ error: "role must be 'teacher' or 'student'" });
    return;
  }

  try {
    const user = await syncClerkUser(clerkId, role as Role);
    const { passwordHash: _omit, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

export default router;
