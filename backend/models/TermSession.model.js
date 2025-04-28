import mongoose from "mongoose";

const classFeeSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  className: { type: String, required: true },
  totalFees: { type: Number, required: true },
});

const termSessionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    yearLabel: { type: String, required: true }, // Example: 2024/2025
    termName: { type: String, required: true },  // Example: Term 1
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    classFees: [classFeeSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TermSession = mongoose.model("TermSession", termSessionSchema);
export default TermSession;
