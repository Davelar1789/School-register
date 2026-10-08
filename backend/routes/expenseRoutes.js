import express from "express";
import {
  createExpense,
  getExpenses,
  getExpensesByCategory,
  deleteExpense,
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createExpense);
router.get("/:schoolId", protect, getExpenses);
router.get('/category-totals/:schoolId', protect, getExpensesByCategory);
router.delete("/:id", protect, deleteExpense);

export default router;
