// models/EarlyYearsReport.model.js
import mongoose from "mongoose";

const EarlyYearsReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Students",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    termId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TermSession",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    // ticks is a flexible object: { "Speaks clearly": "Excellent", "Holds pencil/crayon properly": "Good", ... }
    ticks: {
      type: Map,
      of: {
        type: String,
        enum: ["Excellent", "Very Good", "Good", "Needs Improvement"],
      },
      default: {},
    },
  },
  { timestamps: true }
);

// One report per student per class per term
EarlyYearsReportSchema.index(
  { studentId: 1, classId: 1, termId: 1 },
  { unique: true }
);

const EarlyYearsReport = mongoose.model("EarlyYearsReport", EarlyYearsReportSchema);

export default EarlyYearsReport;
