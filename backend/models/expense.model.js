import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Salaries",
        "Utilities",
        "Postage",
        "Telephone",
        "Stationery",
        "Cleaning and Sanitation",
        "Depreciation",
        "Transport",
        "Feeding cost",
        "Maintenance"
      ],
            required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
