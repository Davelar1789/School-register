import Expense from "../models/expense.model.js";

// POST /api/expenses/create
export const createExpense = async (req, res) => {
  try {
    const { date, description, category, amount } = req.body;
    const schoolId = req.user.schoolId; // assuming you attach schoolId in middleware

    if (!schoolId || !date || !description || !category || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const expense = new Expense({
      school: schoolId,
      date,
      description,
      category,
      amount,
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
