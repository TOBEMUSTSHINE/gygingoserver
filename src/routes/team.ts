import express from "express";
import { protect } from "../middleware/auth.js";
import { createTeam, getUserTeams } from "../controllers/team.js";

const teamRouter = express.Router();

teamRouter.route("/").get(protect, getUserTeams).post(protect, createTeam);

export default teamRouter;