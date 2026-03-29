import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import classesRouter from "./classes";
import decksRouter from "./decks";
import cardsRouter from "./cards";
import reviewsRouter from "./reviews";
import analyticsRouter from "./analytics";
import changelogRouter from "./changelog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(classesRouter);
router.use(decksRouter);
router.use(cardsRouter);
router.use(reviewsRouter);
router.use(analyticsRouter);
router.use("/api/changelog", changelogRouter);

export default router;
