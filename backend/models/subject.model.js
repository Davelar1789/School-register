import mongoose from "mongoose";
const { Schema } = mongoose;

const topicSchema = new Schema({
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const courseMaterialSchema = new Schema({
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  topics: [topicSchema],
});

const subjectSchema = new Schema({
  name: { type: String, required: true },
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  classes: [{ type: Schema.Types.ObjectId, ref: "Class" }],
  courseMaterials: [courseMaterialSchema], // Per-term course materials
});

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
