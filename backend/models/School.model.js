import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    headmaster: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    website: { type: String },
    numberOfStudents: { type: Number },
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
export default School;
