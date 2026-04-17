import express from "express";
import { getDashboardStats } from "../controllers/dashboard.js";
import { protect } from "../middleware/auth.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", protect, getDashboardStats);

export default dashboardRouter;