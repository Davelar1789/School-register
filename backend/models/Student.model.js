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
    name: String,
    class: String,
    idno: String,
    dob: String,
    phone: String,
    address: String,
    images: [String], // specify array of strings
    subjects: [subjectSchema],
    fees: [{
      term: String,
      amount: Number,
      arrears: Number,
      totalFees: Number
    }],
    attendance: [attendanceSchema], // Add attendance field
    totalAttendance: Number, // Add total attendance field
    year: String, // Add year field
    termBeginDate: String, // Add term begin date field
    termEndDate: String // Add term end date field
  },
  { timestamps: true }
);

const Students = model("students", studentSchema);
export default Students;
