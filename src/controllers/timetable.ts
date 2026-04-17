import type { Request, Response } from "express";
import { logActivity } from "../utils/activitieslog.js";
import { inngest } from "../inngest/index.js";
import Timetable from "../models/timetable.js";

export const generateTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId, academicYearId, settings } = req.body;

    await inngest.send({
      name: "generate/timetable",
      data: {
        classId,
        academicYearId,
        settings,
      },
    });
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Requested timetable generation for class ID: ${classId}`,
    });
    res.status(200).json({ message: "Timetable generation initiated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const timetable = await Timetable.findOne({ class: req.params.classId })
      .populate("schedule.periods.subject", "name code")
      .populate("schedule.periods.teacher", "name email");

    if (!timetable) {
      res.status(404).json({ message: "Timetable not found" });
      return;
    }
    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};