import express from "express";
import {
  createFee,
  getFees,
  updateFee,
  deleteFee,
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  createSalary,
  getSalaries,
  updateSalary,
  deleteSalary,
} from "../controllers/finance.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All finance routes are admin-only
router.use(protect, authorize(["admin"]));

// Fees
router.post("/fees", createFee);
router.get("/fees", getFees);
router.put("/fees/:id", updateFee);
router.delete("/fees/:id", deleteFee);

// Expenses
router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);
router.put("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);

// Salaries
router.post("/salaries", createSalary);
router.get("/salaries", getSalaries);
router.put("/salaries/:id", updateSalary);
router.delete("/salaries/:id", deleteSalary);

export default router;