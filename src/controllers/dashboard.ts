import type { Request, Response } from "express";
import User from "../models/user.js";
import Class from "../models/class.js";
import Exam from "../models/exam.js";
import Submission from "../models/submission.js";
import ActivityLog from "../models/activitieslog.js";
import Timetable from "../models/timetable.js";

const getTodayName = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long" });

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let stats = {};
    const activityQuery = user.role === "admin" ? {} : { user: user._id };
    const recentActivities = await ActivityLog.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const formattedActivity = recentActivities.map(
      (log) =>
        `${(log.user as any).name}: ${log.action} (${new Date(
          log.createdAt as any
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
    );

    if (user.role === "admin") {
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalTeachers = await User.countDocuments({ role: "teacher" });
      const activeExams = await Exam.countDocuments({ isActive: true });
      const avgAttendance = "94.5%";

      stats = {
        totalStudents,
        totalTeachers,
        activeExams,
        avgAttendance,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "teacher") {
      const myClassesCount = await Class.countDocuments({ classTeacher: user._id });
      const myExams = await Exam.find({ teacher: user._id }).select("_id");
      const myExamIds = myExams.map((exam) => exam._id);
      const pendingGrading = await Submission.countDocuments({
        exam: { $in: myExamIds },
        score: 0,
      });
      const today = getTodayName();
      const nextClass = "Mathematics - Grade 10";
      const nextClassTime = "10:00 AM";

      stats = {
        myClassesCount,
        pendingGrading,
        nextClass,
        nextClassTime,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "student") {
      const nextExam = await Exam.findOne({
        class: user.studentClass,
        dueDate: { $gte: new Date() },
      }).sort({ dueDate: 1 });

      const pendingAssignments = await Exam.countDocuments({
        class: user.studentClass,
        isActive: true,
        dueDate: { $gte: new Date() },
      });

      const myAttendance = "98%";

      stats = {
        myAttendance,
        pendingAssignments,
        nextExam: nextExam?.title || "No upcoming exams",
        nextExamDate: nextExam
          ? new Date(nextExam.dueDate).toLocaleDateString()
          : "",
        recentActivity: formattedActivity,
      };
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};