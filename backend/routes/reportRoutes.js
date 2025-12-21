import express from "express";
import { generateClassReports, generateStudentReport } from "../controllers/reportGeneratorController.js";
import { previewClassReports } from "../controllers/reportPreviewController.js";
import { generateClassReports2} from "../controllers/report2.js";

const router = express.Router();

router.get("/generate/class/:classId", generateClassReports);
router.get("/generate2/class/:classId", generateClassReports2);
router.get("/student/:studentId", generateStudentReport);
router.get("/reports/preview/class/:classId", previewClassReports)


export default router;
