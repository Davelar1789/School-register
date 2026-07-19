import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "marking-schemes",
    resource_type: "raw", // required for PDFs/docs — cloudinary treats non-image files as "raw"
    allowed_formats: ["pdf", "doc", "docx"],
    // Keep original-ish name so downloads look clean
    public_id: (req, file) => {
      const clean = file.originalname.split(".")[0].replace(/\s+/g, "_");
      return `${clean}-${Date.now()}`;
    },
  },
});

const uploadMarkingScheme = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cap
});

export default uploadMarkingScheme;