// models/Class.model.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  className: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  level: {
    type: String,
    enum: ["Nursery", "Primary", "Junior High", "Senior High"],
    required: true,
  },
  subjects: [
    {
      type: String,
    },
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", // optional: can be used to assign a head teacher
  },
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);

export default Class;
