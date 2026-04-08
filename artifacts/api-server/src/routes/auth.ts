import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, signToken, type JwtPayload } from "../middlewares/auth";

const router: IRouter = Router();

const COOKIE_NAME = "vocab_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "name, email, password, and role are required" });
    return;
  }

  if (role !== "teacher" && role !== "student") {
    res.status(400).json({ error: "role must be 'teacher' or 'student'" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ name, email, role, passwordHash })
    .returning();

  const payload: JwtPayload = { id: user.id, role: user.role, name: user.name, email: user.email };
  const token = signToken(payload);

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.passwordHash) {
    res.status(401).json({ error: "This account does not have a password set" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const payload: JwtPayload = { id: user.id, role: user.role, name: user.name, email: user.email };
  const token = signToken(payload);

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.get("/auth/me", requireAuth, (req, res): void => {
  res.json(req.user);
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

export default router;
