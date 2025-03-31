import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User model
    name: { type: String, required: true },
    headmaster: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    website: { type: String },
    establishedYear: { type: String },
    numberOfStudents: { type: Number, default: 0 },
    numberOfTeachers: { type: Number, default: 0 },
    numberOfClasses: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved"], default: "pending" }
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
export default School;
