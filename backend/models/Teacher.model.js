// models/Teacher.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


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
  subjectSpecialization: {
    type: [String],
    default: [],
  },
  classesAssigned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // assuming you have a Class model
    }
  ],  
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
  password: { type: String }, // New field
  usage: {
    type: String,
    enum: ["used", "not used"],
    default: "not used"
  },
}, { timestamps: true });

// Method to compare password
teacherSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
