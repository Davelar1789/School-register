import express from "express";
import { generateClassReports, generateStudentReport } from "../controllers/reportGeneratorController.js";

const router = express.Router();

router.get("/generate/class/:classId", generateClassReports);
router.get("/student/:studentId", generateStudentReport);


export default router;
