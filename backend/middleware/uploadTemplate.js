import multer from "multer";
import path from "path";

// Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/templates"); // this folder must exist
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // e.g. .docx
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter: only allow Word documents
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    cb(null, true);
  } else {
    cb(new Error("Only .docx files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
