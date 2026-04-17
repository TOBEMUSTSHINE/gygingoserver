import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getAllActivities } from "../controllers/activitieslog.js";

const LogsRouter = express.Router();

LogsRouter.get("/", protect, authorize(["admin", "teacher", "mentor"]), getAllActivities);

export default LogsRouter;