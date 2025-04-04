// models/Student.model.js

import { Schema, model } from "mongoose";

const attendanceSchema = new Schema({
  week: Number,
  days: [Boolean], // Array of 5 booleans representing attendance for each day of the week
});

const subjectSchema = new Schema({
  name: String,
  assessments: [Number],
  exam: Number,
  classScore: Number,
  examScore: Number,
  totalScore: Number,
  position: Number, // Change String to Number for storing position
});

const studentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    idno: { type: String, required: true, unique: true, trim: true },
    dob: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    images: [{ type: String }],
    subjects: [subjectSchema],
    fees: [{
      term: { type: String },
      amount: { type: Number, default: 0 },
      arrears: { type: Number, default: 0 },
      totalFees: { type: Number, default: 0 },
      paid: { type: Boolean, default: false }
    }],
    attendance: [attendanceSchema], // Add attendance field
    totalAttendance: Number, // Add total attendance field
    year: String, // Add year field
    termBeginDate: { type: Date },
    termEndDate: { type: Date },
  },
  { timestamps: true }
);

const Students = model("students", studentSchema);
export default Students;
