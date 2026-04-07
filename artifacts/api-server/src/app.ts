import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler } from "./middlewares/error-handler";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(authMiddleware);

const API_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const API_RATE_LIMIT_MAX = Number(process.env.API_RATE_LIMIT_MAX ?? 300);
const REVIEW_RATE_LIMIT_MAX = Number(process.env.REVIEW_RATE_LIMIT_MAX ?? 120);

const apiLimiter = rateLimit({
  windowMs: API_RATE_LIMIT_WINDOW_MS,
  max: API_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const reviewLimiter = rateLimit({
  windowMs: API_RATE_LIMIT_WINDOW_MS,
  max: REVIEW_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many review submissions, please slow down." },
});

app.use("/api", apiLimiter);
app.use("/api/reviews", reviewLimiter);
app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(process.cwd(), "artifacts/srs-app/dist/public");
  if (fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
    logger.info({ staticDir }, "Serving static frontend files in production");
  } else {
    logger.warn({ staticDir }, "Static frontend dir not found — frontend not served");
  }
}

app.use(errorHandler);

export default app;
