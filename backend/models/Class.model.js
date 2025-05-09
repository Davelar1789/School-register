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
  description: String,
  level: {
    type: String,
    enum: ["Nursery", "Kindergaten", "Primary", "Junior High", "Senior High"],
    required: true,
  },
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  subjects: [
    {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      teachers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
      ],
    },
  ],
  feedingFee: { type: Number, required: true },
  
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);
export default Class;
