import express from "express";
import {
  triggerExamGeneration,
  getExams,
  submitExam,
  getExamById,
  toggleExamStatus,
  getExamResult,
} from "../controllers/exam.js";
import { protect, authorize } from "../middleware/auth.js";

const examRouter = express.Router();

examRouter.post(
  "/generate",
  protect,
  authorize(["teacher", "admin"]),
  triggerExamGeneration
);

examRouter.get(
  "/",
  protect,
  authorize(["teacher", "student", "admin"]),
  getExams
);

examRouter.post(
  "/:id/submit",
  protect,
  authorize(["student", "admin"]),
  submitExam
);

examRouter.patch(
  "/:id/status",
  protect,
  authorize(["teacher", "admin"]),
  toggleExamStatus
);

examRouter.get(
  "/:id/result",
  protect,
  authorize(["student", "admin", "teacher"]),
  getExamResult
);

examRouter.get(
  "/:id",
  protect,
  authorize(["teacher", "student", "admin"]),
  getExamById
);

export default examRouter;