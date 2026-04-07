/**
 * Lightweight auth middleware stubs.
 * Auth is handled client-side via localStorage role selection.
 * These no-op middlewares are kept for interface compatibility.
 */
import type { Request, Response, NextFunction } from "express";

export type Role = "teacher" | "student";

export function requireAuth() {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}

export function requireRole(_role: Role) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}

export async function getDbUser(_req: Request) {
  return null;
}
