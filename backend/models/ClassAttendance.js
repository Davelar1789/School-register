import mongoose from "mongoose";

const classAttendanceSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    marked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness: one record per class + term + date
classAttendanceSchema.index({ classId: 1, termId: 1, date: 1 }, { unique: true });

const ClassAttendance = mongoose.model("ClassAttendance", classAttendanceSchema);
export default ClassAttendance;
