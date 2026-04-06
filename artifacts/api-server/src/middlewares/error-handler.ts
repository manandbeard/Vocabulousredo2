import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Centralised Express error-handling middleware.
 *
 * Must be registered AFTER all routes (with four parameters Express treats it
 * as an error handler). Catches anything passed to `next(err)` or thrown
 * inside async handlers that are properly wrapped.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode =
    err instanceof Error && "statusCode" in err
      ? (err as Error & { statusCode: number }).statusCode
      : 500;

  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  logger.error({ err }, "Unhandled error");

  if (!res.headersSent) {
    res.status(statusCode).json({ error: message });
  }
}
