import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const generateMockClassAnalytics = (classId: string) => ({
  classId,
  className: "Grade 10A",
  subjectPerformance: [
    { subject: "Mathematics", averageScore: 78, maxScore: 100, students: 32 },
    { subject: "Physics", averageScore: 82, maxScore: 100, students: 32 },
    { subject: "Chemistry", averageScore: 74, maxScore: 100, students: 32 },
    { subject: "English", averageScore: 85, maxScore: 100, students: 32 },
    { subject: "History", averageScore: 79, maxScore: 100, students: 32 },
  ],
  attendanceTrend: [
    { month: "Jan", rate: 92 },
    { month: "Feb", rate: 88 },
    { month: "Mar", rate: 94 },
    { month: "Apr", rate: 90 },
    { month: "May", rate: 91 },
  ],
  examScoreDistribution: [
    { range: "90-100", count: 5 },
    { range: "80-89", count: 12 },
    { range: "70-79", count: 8 },
    { range: "60-69", count: 4 },
    { range: "below 60", count: 3 },
  ],
  topPerformers: [
    { name: "Alice Johnson", average: 96 },
    { name: "Bob Smith", average: 94 },
    { name: "Carol Davis", average: 92 },
  ],
});

const generateMockStudentAnalytics = (studentId: string) => ({
  studentId,
  studentName: "John Doe",
  subjectScores: [
    { subject: "Mathematics", score: 85, classAverage: 78 },
    { subject: "Physics", score: 90, classAverage: 82 },
    { subject: "Chemistry", score: 72, classAverage: 74 },
    { subject: "English", score: 88, classAverage: 85 },
    { subject: "History", score: 81, classAverage: 79 },
  ],
  attendanceRate: 94,
  attendanceTrend: [
    { month: "Jan", rate: 95 },
    { month: "Feb", rate: 92 },
    { month: "Mar", rate: 98 },
    { month: "Apr", rate: 91 },
    { month: "May", rate: 94 },
  ],
  recentExamScores: [
    { exam: "Midterm Math", score: 87, date: "2025-03-15" },
    { exam: "Physics Quiz", score: 92, date: "2025-03-22" },
    { exam: "English Essay", score: 84, date: "2025-03-28" },
  ],
});

export const getClassAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classId = req.params.classId as string;
    if (!classId) {
      res.status(400).json({ message: "Class ID is required" });
      return;
    }
    const data = generateMockClassAnalytics(classId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;
    if (!studentId) {
      res.status(400).json({ message: "Student ID is required" });
      return;
    }
    const data = generateMockStudentAnalytics(studentId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};