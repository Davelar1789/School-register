import { Schema, model } from "mongoose";

// Helper function to check if a date is a weekend
const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

const attendanceSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  termId: { type: Schema.Types.ObjectId, ref: "TermSession", required: true },
  date: { 
    type: Date, 
    required: true, 
    validate: {
      validator: function(date) {
        return !isWeekend(date);
      },
      message: "Attendance cannot be marked on weekends."
    }
  },
  present: { type: Boolean, required: true }, // true (present) or false (absent)
}, { timestamps: true });

// Prevent duplicate attendance entries for the same student on the same date
attendanceSchema.index({ studentId: 1, termId: 1, date: 1 }, { unique: true });

const Attendance = model("Attendance", attendanceSchema);
export default Attendance;