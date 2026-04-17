import type { Request, Response } from "express";
import Class from "../models/class.js";
import { logActivity } from "../utils/activitieslog.js";
import mongoose from "mongoose";

export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, academicYear, classTeacher, capacity } = req.body;

    const existingClass = await Class.findOne({ name, academicYear });
    if (existingClass) {
      res.status(400).json({
        message: "Class with this name already exists for the specified academic year.",
      });
      return;
    }

    const newClass = await Class.create({
      name,
      academicYear,
      classTeacher,
      capacity,
    });
    await logActivity({
      userId: (req as any).user.id,
      action: `Created new class: ${newClass.name}`,
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [total, classes] = await Promise.all([
      Class.countDocuments(query),
      Class.find(query)
        .populate("academicYear", "name")
        .populate("classTeacher", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      classes,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const classId = Array.isArray(idParam) ? idParam[0] : idParam;
    const { name, academicYear } = req.body;

    if (classId) {
      const existingClass = await Class.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(classId) },
        name,
        academicYear,
      });
      if (existingClass) {
        res.status(400).json({ message: "Class with this name and year already exists" });
        return;
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedClass) {
      res.status(404).json({ message: "Class not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user.id,
      action: `Updated class: ${updatedClass.name}`,
    });
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Deleted class: ${deletedClass?.name}`,
    });
    if (!deletedClass) {
      res.status(404).json({ message: "Class not found" });
      return;
    }
    res.json({ message: "Class removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};