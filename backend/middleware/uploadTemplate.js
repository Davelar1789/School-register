import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "report_templates", // Folder name in Cloudinary
    resource_type: "raw", // Needed for .docx, .pdf, etc.
    format: async (req, file) => "docx", // Optional
    public_id: (req, file) => `template-${Date.now()}`,
  },
});

const upload = multer({ storage });
export default upload;
