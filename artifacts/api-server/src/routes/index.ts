import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import surveysRouter from "./surveys";
import compatRouter from "./compat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(surveysRouter);
router.use(compatRouter);

export default router;
