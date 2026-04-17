import type { Request, Response } from "express";
import Team from "../models/team.js";
import type { AuthRequest } from "../middleware/auth.js";

export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, logo } = req.body;
    if (!name) {
      res.status(400).json({ message: "Team name is required" });
      return;
    }

    const team = await Team.create({
      name,
      logo,
      members: [req.user!._id],
      createdBy: req.user!._id,
    });

    await team.populate("members", "name email");

    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await Team.find({ members: req.user!._id })
      .populate("members", "name email")
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};