// models/GradeEntry.js
import mongoose from "mongoose";

const gradeEntrySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  termId: { type: mongoose.Schema.Types.ObjectId, ref: "TermSession", required: true },

  scores: {
    test1: { type: Number, default: 0 },  // 10 marks
    test2: { type: Number, default: 0 },  // 10 marks
    test3: { type: Number, default: 0 },  // 10 marks
    test4: { type: Number, default: 0 },  // 20 marks
    exam: { type: Number, default: 0 },   // 100 marks
    total: { type: Number, default: 0 },
    position: { type: Number, default: 0 }, // calculated later
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
}, {
  timestamps: true,
});

export default mongoose.model("GradeEntry", gradeEntrySchema);
