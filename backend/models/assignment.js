import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  dueDate: { type: Date, required: true },
  postedBy: { type: String, required: true },
});

export default mongoose.model("Assignment", assignmentSchema);
