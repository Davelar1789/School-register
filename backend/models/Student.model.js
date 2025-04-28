import { Schema, model } from "mongoose";

const attendanceSchema = new Schema({
  week: Number,
  days: [Boolean], // Array of 5 booleans representing attendance
});

const subjectSchema = new Schema({
  name: String,
  assessments: [Number], 
  exam: Number,
  classScore: Number,
  examScore: Number,
  totalScore: Number,
  position: Number,
});

const feesSchema = new Schema({
  totalFees: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  arrears: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  paymentHistory: [
    {
      date: { type: Date },
      amount: { type: Number },
    }
  ],
});

const termSchema = new Schema({
  termName: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  attendance: [attendanceSchema],
  totalAttendance: { type: Number, default: 0 },
  subjects: [subjectSchema],
  fees: feesSchema,
  startDate: { type: Date },
  endDate: { type: Date },
});

const yearSchema = new Schema({
  yearLabel: { type: String, required: true }, // e.g. "2024/2025"
  terms: [termSchema],
});

const studentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    classes: [{ type: Schema.Types.ObjectId, ref: "Class" }],
    idno: { type: String, unique: true, trim: true },
    dob: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    images: [{ type: String }],
    academicRecords: [yearSchema], // <<< THIS HOLDS EVERYTHING
    schoolId: { type: Schema.Types.ObjectId, ref: "schools", required: true },
  },
  { timestamps: true }
);

const Students = model("students", studentSchema);
export default Students;
