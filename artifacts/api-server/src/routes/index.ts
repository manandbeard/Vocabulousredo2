import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import classesRouter from "./classes";
import decksRouter from "./decks";
import cardsRouter from "./cards";
import reviewsRouter from "./reviews";
import analyticsRouter from "./analytics";
import changelogRouter from "./changelog";
import achievementsRouter from "./achievements";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Public routes — no authentication required
router.use(healthRouter);
router.use(authRouter);

// All routes below this line require a valid Clerk session
router.use(requireAuth());
router.use(usersRouter);
router.use(classesRouter);
router.use(decksRouter);
router.use(cardsRouter);
router.use(reviewsRouter);
router.use(analyticsRouter);
router.use("/changelog", changelogRouter);
router.use(achievementsRouter);

export default router;
