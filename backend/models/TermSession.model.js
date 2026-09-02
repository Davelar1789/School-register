import mongoose from "mongoose";

const classFeeSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  className: { type: String, required: true },
  totalFees: { type: Number, required: true },
});

const termSessionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    yearLabel: { type: String, required: true }, 
    termName: { type: String, required: true }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    classFees: [classFeeSchema],
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate term sessions for same school, year, and term
termSessionSchema.index(
  { schoolId: 1, yearLabel: 1, termName: 1 },
  { unique: true }
);

const TermSession = mongoose.model("TermSession", termSessionSchema);
export default TermSession;
