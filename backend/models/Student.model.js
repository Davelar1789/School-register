import mongoose, { Schema, model } from "mongoose";

const attendanceSchema = new Schema({
  week: Number,
  days: {
    type: [String],
    enum: ["present", "absent", "not_marked"],
    default: ["not_marked", "not_marked", "not_marked", "not_marked", "not_marked"]
  }
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
      date: { type: Date, default: Date.now },
      amount: { type: Number },
      method: { type: String }, // e.g. "Cash", "Bank Transfer", etc.
      note: { type: String },   // optional additional notes
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
    gender: { type: String, enum: ["male", "female"], default: "male",},
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    images: [{ type: String }],
    academicRecords: [yearSchema], // <<< THIS HOLDS EVERYTHING
    schoolId: { type: Schema.Types.ObjectId, ref: "schools", required: true },
    feedingFee: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Students = model("students", studentSchema);
if (!mongoose.models.Student) {
  mongoose.model("Student", studentSchema);
}
export default Students;
