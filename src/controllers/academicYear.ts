import type { Request, Response } from "express";
import AcademicYear from "../models/academicYear.js";
import { logActivity } from "../utils/activitieslog.js";
import mongoose from "mongoose";

export const createAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, fromYear, toYear, isCurrent } = req.body;

    const existingYear = await AcademicYear.findOne({ fromYear, toYear });
    if (existingYear) {
      res.status(400).json({ message: "Academic Year already exists" });
      return;
    }

    if (isCurrent) {
      await AcademicYear.updateMany({}, { isCurrent: false });
    }
    const academicYear = await AcademicYear.create({
      name,
      fromYear,
      toYear,
      isCurrent: isCurrent || false,
    });
    await logActivity({
      userId: (req as any).user._id,
      action: `Created academic year ${name}`,
    });
    res.status(201).json(academicYear);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllAcademicYears = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const [total, years] = await Promise.all([
      AcademicYear.countDocuments(query),
      AcademicYear.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      years,
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

export const getCurrentAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentYear = await AcademicYear.findOne({ isCurrent: true });
    if (!currentYear) {
      res.status(404).json({ message: "No current academic year found" });
      return;
    }
    res.status(200).json(currentYear);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isCurrent } = req.body;
    if (isCurrent) {
      // Safely extract the ID from req.params (could be string or string[])
      const idParam = req.params.id;
      const idString = Array.isArray(idParam) ? idParam[0] : idParam;
      if (idString) {
        await AcademicYear.updateMany(
          { _id: { $ne: new mongoose.Types.ObjectId(idString) } },
          { isCurrent: false }
        );
      }
    }

    const updatedYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedYear) {
      res.status(404).json({ message: "Academic Year not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Updated academic year ${updatedYear.name}`,
    });
    res.status(200).json(updatedYear);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) {
      res.status(404).json({ message: "Academic Year not found" });
      return;
    }
    if (year.isCurrent) {
      res.status(400).json({ message: "Cannot delete the current academic year" });
      return;
    }
    await year.deleteOne();
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted academic year ${year.name}`,
    });
    res.status(200).json({ message: "Academic Year deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};