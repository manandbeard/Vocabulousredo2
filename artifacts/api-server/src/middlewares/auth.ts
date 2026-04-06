/**
 * Clerk auth middleware helpers for Express 5.
 *
 * Usage:
 *   import { requireAuth, requireRole, getDbUser } from "../middlewares/auth";
 *
 *   // Protect an entire router
 *   router.use(requireAuth());
 *
 *   // Require a specific role
 *   router.get("/classes", requireRole("teacher"), handler);
 *
 *   // Read the authenticated DB user inside a handler
 *   const user = await getDbUser(req);
 */
import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type Role = "teacher" | "student";

// ── requireAuth ───────────────────────────────────────────────────────────────

/**
 * Middleware that returns 401 when no valid Clerk session is present.
 * Apply this after `clerkMiddleware()` has been registered in app.ts.
 */
export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized — sign in required" });
      return;
    }
    next();
  };
}

// ── requireRole ───────────────────────────────────────────────────────────────

/**
 * Middleware that enforces the caller has the given role (stored in our DB).
 * Implicitly requires auth — no need to stack requireAuth() before it.
 */
export function requireRole(role: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized — sign in required" });
      return;
    }

    const user = await getDbUserByClerkId(clerkId);
    if (!user) {
      res.status(403).json({ error: "User account not found — please complete registration" });
      return;
    }

    if (user.role !== role) {
      res.status(403).json({ error: `Forbidden — ${role} role required` });
      return;
    }

    next();
  };
}

// ── getDbUser ─────────────────────────────────────────────────────────────────

/**
 * Look up the authenticated user's DB record from the Clerk session.
 * Returns null when the user hasn't completed their profile yet.
 */
export async function getDbUser(req: Request) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return null;
  return getDbUserByClerkId(clerkId);
}

// ── internal helpers ──────────────────────────────────────────────────────────

async function getDbUserByClerkId(clerkId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.googleId, clerkId));
  return user ?? null;
}

/**
 * Find-or-create a DB user record for a newly authenticated Clerk user.
 * Call this from the /api/auth/me and /api/auth/sync-user routes.
 */
export async function syncClerkUser(clerkId: string, role: Role): Promise<typeof usersTable.$inferSelect> {
  // 1. Check if user already exists in our DB
  const existing = await getDbUserByClerkId(clerkId);
  if (existing) return existing;

  // 2. Fetch the Clerk user record for name/email
  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkId}@unknown.clerk`;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    email.split("@")[0];

  const avatarUrl = clerkUser.imageUrl ?? null;

  // 3. Insert into our users table — googleId stores the Clerk user ID
  const [newUser] = await db
    .insert(usersTable)
    .values({ name, email, role, googleId: clerkId, avatarUrl })
    .onConflictDoUpdate({
      target: usersTable.googleId,
      set: { name, avatarUrl },
    })
    .returning();

  return newUser;
}
