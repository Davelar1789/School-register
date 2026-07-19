import mongoose from "mongoose";

const markingSchemeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  term: {
    type: String,
    enum: ["First Term", "Second Term", "Third Term"],
    required: true,
  },
  academicYear: {
    type: String, // e.g. "2025/2026"
    required: true,
  },
  title: {
    type: String, // e.g. "Mathematics End of Term Exam Marking Scheme"
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  filePublicId: {
    type: String, // cloudinary public_id, needed to delete/replace later
    required: true,
  },
  fileName: String,
  fileType: {
    type: String, // pdf, docx, etc — for icon/display purposes
    default: "pdf",
  },
  availableFrom: {
    type: Date, // the exact date+time it becomes unlockable
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // or "User" depending on your admin model name
  },
}, { timestamps: true });

// Useful compound index — one scheme per subject/class/term/year
markingSchemeSchema.index(
  { school: 1, class: 1, subject: 1, term: 1, academicYear: 1 },
  { unique: true }
);

const MarkingScheme = mongoose.model("MarkingScheme", markingSchemeSchema);

export default MarkingScheme;