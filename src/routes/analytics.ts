import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getClassAnalytics, getStudentAnalytics } from "../controllers/analytics.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/class/:classId", protect, authorize(["teacher", "admin"]), getClassAnalytics);
analyticsRouter.get("/student/:studentId", protect, authorize(["student", "mentor", "teacher"]), getStudentAnalytics);

export default analyticsRouter;