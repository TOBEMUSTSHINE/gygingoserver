import { type Request, type Response } from "express";
import ActivityLog from "../models/activitieslog.js";
import type { AuthRequest } from "../middleware/auth.js";

// @desc    Get System Activity Logs (with role‑based filtering)
// @route   GET /api/activities
// @access  Private (Admin, Teacher, Parent)
export const getAllActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = req.user;
    if (!currentUser) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Build filter based on user role
    let filter: any = {};
    if (currentUser.role === "admin") {
      // Admin sees everything – no extra filter
    } else if (currentUser.role === "teacher") {
      // Teacher sees only logs where the target user's role is 'student'
      // We'll need to look up the user for each log – can be done via aggregation
      // Simpler: use a lookup in aggregation
      filter = {}; // we'll handle in aggregation pipeline
    } else if (currentUser.role === "mentor") {
      // Parent sees logs of students and teachers
      filter = {}; // handled in aggregation
    } else {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Aggregation pipeline to join user details and filter by target user's role
    const pipeline: any[] = [
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "targetUser",
        },
      },
      { $unwind: "$targetUser" },
    ];

    // Apply role‑based filtering on targetUser.role
    if (currentUser.role === "teacher") {
      pipeline.push({ $match: { "targetUser.role": "student" } });
    } else if (currentUser.role === "mentor") {
      pipeline.push({
        $match: { "targetUser.role": { $in: ["student", "teacher"] } },
      });
    }

    // Add pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await ActivityLog.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    pipeline.push({ $skip: skip }, { $limit: limit });

    const logs = await ActivityLog.aggregate(pipeline).project({
      _id: 1,
      action: 1,
      details: 1,
      createdAt: 1,
      user: "$targetUser",
    });

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};