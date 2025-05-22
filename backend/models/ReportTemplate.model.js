import mongoose from "mongoose";

const reportTemplateSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  templatePath: { type: String, required: true }, // File system or cloud path
  originalFileName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ReportTemplate", reportTemplateSchema);
