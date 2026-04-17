import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import VideoRoom from "../models/VideoRoom.js";
import ChatMessage from "../models/ChatMessage.js";
import crypto from "crypto";

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Room name is required" });
      return;
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const room = await VideoRoom.create({
      name,
      createdBy: req.user?._id || null,
      isActive: true,
      participants: [],
      inviteToken,
      tokenExpiresAt,
    });

    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create room" });
  }
};

export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await VideoRoom.findById(req.params.id).populate("createdBy", "name");
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await VideoRoom.find({ isActive: true })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const endRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await VideoRoom.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    room.isActive = false;
    room.endedAt = new Date();
    await room.save();
    res.json({ message: "Room ended" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const saveMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { message, userName } = req.body;

    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const msg = await ChatMessage.create({
      roomId,
      userId: req.user?._id,
      userName: req.user?.name || userName || "Guest",
      message,
    });

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId })
      .populate("userId", "name")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const joinViaToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const room = await VideoRoom.findOne({
      inviteToken: token,
      tokenExpiresAt: { $gt: new Date() },
      isActive: true,
    });
    if (!room) {
      res.status(404).json({ message: "Invalid or expired invite link" });
      return;
    }
    res.json({ roomId: room._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};