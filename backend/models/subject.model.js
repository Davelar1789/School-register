import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
});

const courseMaterialSchema = new mongoose.Schema({
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  topics: [topicSchema],
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  courseMaterials: [courseMaterialSchema], // New: store per-term topics
});

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
