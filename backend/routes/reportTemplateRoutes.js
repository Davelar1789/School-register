import express from "express";
import upload from "../middlewares/uploadTemplate.js";
import { uploadTemplate } from "../controllers/reportTemplateController.js";

const router = express.Router();

// Route: POST /api/report-template/upload
router.post("/upload", upload.single("file"), uploadTemplate);

export default router;
