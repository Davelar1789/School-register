// routes/gradeRoutes.js
import express from "express";
import { getStudentGrades, saveStudentGrades } from "../controllers/gradeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET grades for a class & subject
router.get("/grades", protect, getStudentGrades);

// POST/PUT grades for students
router.post("/grades", protect, saveStudentGrades);

export default router;
