import express from "express";
import { searchTopics, getTopic, createTopic } from "../controllers/topic.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", searchTopics);
router.get("/:id", getTopic);
router.post("/", protect, authorize(["admin"]), createTopic);

export default router;