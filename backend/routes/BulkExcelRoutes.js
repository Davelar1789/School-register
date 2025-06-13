import express from "express";
import multer from "multer";
import { uploadStudentsFromExcel } from "../controllers/BulkStudentUpload.controller.js";
import { downloadStudentTemplate } from "../controllers/ExcelTemplate.controller.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/template/download", downloadStudentTemplate);
router.post("/upload-excel", upload.single("file"), uploadStudentsFromExcel);

export default router;
