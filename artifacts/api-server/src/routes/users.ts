import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersResponse,
  CreateUserBody,
  GetUserParams,
  GetUserResponse,
  PatchUserParams,
  PatchUserBody,
  ChangePasswordParams,
  ChangePasswordBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.id);
  res.json(ListUsersResponse.parse(users));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.insert(usersTable).values(parsed.data).returning();
  res.status(201).json(GetUserResponse.parse(user));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetUserResponse.parse(user));
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const params = PatchUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (req.user!.id !== params.data.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const body = PatchUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const updates: Partial<typeof existing> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.bio !== undefined) updates.bio = body.data.bio;
  if (body.data.dailyGoal !== undefined) updates.dailyGoal = body.data.dailyGoal;
  if (body.data.difficultyLevel !== undefined) updates.difficultyLevel = body.data.difficultyLevel;
  if (body.data.emailNotifications !== undefined) updates.emailNotifications = body.data.emailNotifications;
  if (body.data.pushNotifications !== undefined) updates.pushNotifications = body.data.pushNotifications;
  if (body.data.weeklyDigest !== undefined) updates.weeklyDigest = body.data.weeklyDigest;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, params.data.id)).returning();
  res.json(GetUserResponse.parse(updated));
});

router.post("/users/:id/change-password", requireAuth, async (req, res): Promise<void> => {
  const params = ChangePasswordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (req.user!.id !== params.data.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const body = ChangePasswordBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (!user.passwordHash) {
    res.status(400).json({ error: "This account does not have a password set." });
    return;
  }

  const valid = await bcrypt.compare(body.data.currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect." });
    return;
  }

  const newHash = await bcrypt.hash(body.data.newPassword, 12);
  await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, params.data.id));

  res.json({ ok: true });
});

export default router;
