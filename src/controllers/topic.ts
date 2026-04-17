import type { Request, Response } from "express";
import Topic from "../models/topic.js";
import type { AuthRequest } from "../middleware/auth.js";

export const searchTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.json([]);
      return;
    }
    const topics = await Topic.find({
      title: { $regex: query, $options: "i" },
      isActive: true,
    }).select("title outline");
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const topic = await Topic.findById(req.params.id).select("+content");
    if (!topic) {
      res.status(404).json({ message: "Topic not found" });
      return;
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const createTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, outline, content } = req.body;
    const topic = await Topic.create({
      title,
      outline,
      content,
      createdBy: req.user?._id,
    });
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};