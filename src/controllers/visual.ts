import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Visual from "../models/visual.js";
import { inngest } from "../inngest/index.js";

export const requestVisualGeneration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ message: "Prompt is required" });
      return;
    }

    const visual = await Visual.create({
      prompt,
      imageUrl: "",
      generatedBy: req.user!._id,
      isSaved: false,
    });

    await inngest.send({
      name: "visual/generate",
      data: {
        visualId: visual._id,
        prompt,
      },
    });

    res.status(202).json({
      message: "Visual generation started",
      visualId: visual._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVisual = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const visualId = req.params.id as string;
    const visual = await Visual.findById(visualId).populate("generatedBy", "name");
    if (!visual) {
      res.status(404).json({ message: "Visual not found" });
      return;
    }
    res.json(visual);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserVisuals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const visuals = await Visual.find({ generatedBy: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(visuals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const saveVisual = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const visualId = req.params.id as string;
    const visual = await Visual.findById(visualId);
    if (!visual) {
      res.status(404).json({ message: "Visual not found" });
      return;
    }
    visual.isSaved = true;
    await visual.save();

    res.json({ message: "Visual saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};