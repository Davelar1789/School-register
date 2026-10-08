import Expense from "../models/expense.model.js";
import mongoose from 'mongoose';


// POST /api/expenses/create
export const createExpense = async (req, res) => {
  try {
    const { date, description, category, amount } = req.body;
    const schoolId = req.user.schoolId; // assuming you attach schoolId in middleware

    if (!schoolId || !date || !description || !category || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!(Number(amount) > 0)) {
      return res.status(400).json({ message: "Amount must be greater than zero." });
    }

    const expense = new Expense({
      school: schoolId,
      date,
      description: String(description).trim(),
      category,
      amount: Number(amount),
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/expenses/:schoolId
export const getExpenses = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const expenses = await Expense.find({ school: schoolId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getExpensesByCategory = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const results = await Expense.aggregate([
      {
        $match: {
          school: new mongoose.Types.ObjectId(schoolId),
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const categoryTotals = {};
    results.forEach((item) => {
      categoryTotals[item._id] = item.totalAmount;
    });

    res.json(categoryTotals);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// DELETE /api/expenses/:id  — only the owning school may remove an expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (String(expense.school) !== String(req.user.schoolId)) {
      return res.status(403).json({ message: "You can't delete another school's expense." });
    }

    await expense.deleteOne();
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};
