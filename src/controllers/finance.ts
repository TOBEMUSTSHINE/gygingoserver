import type { Request, Response } from "express";
import Fee from "../models/Fee.js";
import Expense from "../models/Expense.js";
import Salary from "../models/Salary.js";
import User from "../models/user.js";
import { logActivity } from "../utils/activitieslog.js";

export const createFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, academicYearId, ...rest } = req.body;
    const feeData = {
      student: studentId,
      academicYear: academicYearId,
      ...rest,
    };
    const fee = await Fee.create(feeData);
    await logActivity({
      userId: (req as any).user._id,
      action: `Created fee for student ${fee.student}`,
    });
    res.status(201).json(fee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getFees = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = {};
    if (search) {
      const students = await User.find({ name: { $regex: search, $options: "i" } }).select("_id");
      filter.student = { $in: students.map((s) => s._id) };
    }

    const [fees, total] = await Promise.all([
      Fee.find(filter)
        .populate("student", "name email")
        .populate("academicYear", "name")
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit),
      Fee.countDocuments(filter),
    ]);

    res.json({
      fees,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fee) {
      res.status(404).json({ message: "Fee record not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Updated fee ${fee._id}`,
    });
    res.json(fee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      res.status(404).json({ message: "Fee record not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted fee ${fee._id}`,
    });
    res.json({ message: "Fee record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { academicYearId, ...rest } = req.body;
    const expenseData = {
      academicYear: academicYearId,
      ...rest,
    };
    const expense = await Expense.create(expenseData);
    await logActivity({
      userId: (req as any).user._id,
      action: `Created expense: ${expense.description}`,
    });
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate("academicYear", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filter),
    ]);

    res.json({
      expenses,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Updated expense ${expense._id}`,
    });
    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted expense ${expense._id}`,
    });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const createSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, academicYearId, ...rest } = req.body;
    const salaryData = {
      employee: employeeId,
      academicYear: academicYearId,
      ...rest,
    };
    const salary = await Salary.create(salaryData);
    await logActivity({
      userId: (req as any).user._id,
      action: `Created salary for employee ${salary.employee}`,
    });
    res.status(201).json(salary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getSalaries = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let filter: Record<string, unknown> = {};
    if (search) {
      const employees = await User.find({ name: { $regex: search, $options: "i" } }).select("_id");
      filter.employee = { $in: employees.map((e) => e._id) };
    }

    const [salaries, total] = await Promise.all([
      Salary.find(filter)
        .populate("employee", "name email")
        .populate("academicYear", "name")
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(limit),
      Salary.countDocuments(filter),
    ]);

    res.json({
      salaries,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salary) {
      res.status(404).json({ message: "Salary record not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Updated salary ${salary._id}`,
    });
    res.json(salary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) {
      res.status(404).json({ message: "Salary record not found" });
      return;
    }
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted salary ${salary._id}`,
    });
    res.json({ message: "Salary record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};