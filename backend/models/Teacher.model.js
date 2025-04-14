// models/Teacher.model.js
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  staffId: {
    type: String,
    unique: true,
    required: true,
  },
  gender: String,
  dob: Date,
  phone: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  address: String,
  qualification: String,
  subjectSpecialization: [String],
  classAssigned: String,
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  image: String,
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
  },
  status: {
    type: String,
    enum: ["Active", "On Leave", "Retired"],
    default: "Active",
  },
}, { timestamps: true });

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
