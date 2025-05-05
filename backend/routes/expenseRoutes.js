import express from "express";
import {
  createExpense,
  getExpenses,
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createExpense);
router.get("/:schoolId", protect, getExpenses);

export default router;
