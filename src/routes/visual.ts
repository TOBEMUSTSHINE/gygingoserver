import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  requestVisualGeneration,
  getVisual,
  getUserVisuals,
  saveVisual,
} from "../controllers/visual.js";

const visualRouter = express.Router();

visualRouter.post("/generate", protect, authorize(["teacher", "admin"]), requestVisualGeneration);
visualRouter.get("/", protect, authorize(["teacher", "admin"]), getUserVisuals);
visualRouter.get("/:id", protect, getVisual);
visualRouter.post("/:id/save", protect, authorize(["teacher", "admin"]), saveVisual);

export default visualRouter;