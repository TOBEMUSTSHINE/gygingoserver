import type { Request, Response } from "express";
import { logActivity } from "../utils/activitieslog.js";
import Exam from "../models/exam.js";
import Subject from "../models/subject.js";
import Submission from "../models/submission.js";
import { inngest } from "../inngest/index.js";

export const triggerExamGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      subject,
      class: classId,
      duration,
      dueDate,
      topic,
      difficulty,
      count,
    } = req.body;
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const teacherId = (req as any).user._id;
    const draftExam = await Exam.create({
      title: title || `Auto-Generated: ${topic}`,
      subject,
      class: classId,
      teacher: teacherId,
      duration: duration || 60,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: false,
      questions: [],
    });

    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `User triggered exam generation: ${draftExam._id}`,
    });

    await inngest.send({
      name: "exam/generate",
      data: {
        examId: draftExam._id,
        topic,
        subjectName: subjectDoc.name,
        difficulty: difficulty || "Medium",
        count: count || 10,
      },
    });
    res.status(202).json({
      message: "Exam generation started.",
      examId: draftExam._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const createExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await Exam.create({
      ...req.body,
      teacher: (req as any).user._id,
    });
    const userId = (req as any).user._id;
    await logActivity({ userId, action: "User created a new exam" });
    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let query = {};

    if (user.role === "student") {
      query = { class: user.studentClass, isActive: true };
    } else if (user.role === "teacher") {
      query = { teacher: user._id };
    }

    const exams = await Exam.find(query)
      .populate("subject", "name")
      .populate("class", "name section")
      .select("-questions.correctAnswer");

    res.json(exams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const examId = req.params.id;
    const user = (req as any).user;

    let query = Exam.findById(examId)
      .populate("subject", "name code")
      .populate("class", "name section")
      .populate("teacher", "name email");

    if (user.role === "teacher" || user.role === "admin") {
      query = query.select("+questions.correctAnswer");
    }

    const exam = await query;

    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    if (user.role === "student") {
      const examClassId = exam.class._id
        ? exam.class._id.toString()
        : exam.class.toString();
      const userClassId = user.studentClass ? user.studentClass.toString() : "";
      if (examClassId !== userClassId) {
        res.status(403).json({ message: "You are not authorized to view this exam." });
        return;
      }
    }

    res.json(exam);
  } catch (error: any) {
    if (error.name === "CastError") {
      res.status(400).json({ message: "Invalid exam ID" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleExamStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const examId = req.params.id;
    const user = (req as any).user;

    const exam = await Exam.findById(examId);

    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    if (user.role !== "admin" && exam.teacher.toString() !== user._id.toString()) {
      res.status(403).json({ message: "Not authorized to modify this exam" });
      return;
    }

    exam.isActive = !exam.isActive;
    await exam.save();
    const userId = (req as any).user._id;
    await logActivity({ userId, action: "User toggled exam status" });
    res.json({
      message: `Exam is now ${exam.isActive ? "Active" : "Inactive"}`,
      _id: exam._id,
      isActive: exam.isActive,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const studentId = (req as any).user._id;
    const examId = req.params.id;

    await inngest.send({
      name: "exam/submit",
      data: {
        examId,
        studentId,
        answers,
      },
    });

    const userId = (req as any).user._id;
    await logActivity({ userId, action: "User submitted an exam" });

    res.status(201).json({
      message: "Exam submission received and is being processed.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user._id;
    const examId = req.params.id;

    const submission = await Submission.findOne({
      exam: examId,
      student: studentId,
    }).populate({
      path: "exam",
      select: "title questions._id questions.correctAnswer",
    });
    if (!submission) {
      res.status(404).json({ message: "No submission found" });
      return;
    }
    // Security: ensure the submission belongs to the requesting student
    if (submission.student.toString() !== studentId.toString()) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};