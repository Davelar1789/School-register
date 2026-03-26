// routes/gradeRoutes.js
import express from "express";
import {
  getStudentGrades,
  saveStudentGrades,
  cleanupInvalidGrades,
} from "../controllers/gradeController.js";
import {
  getEarlyYearsReport,
  saveEarlyYearsReport,
} from "../controllers/earlyYearsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Regular gradebook ────────────────────────────────────────────────────────
router.get("/grades", protect, getStudentGrades);
router.post("/grades", protect, saveStudentGrades);
router.patch("/cleanup-invalid-grades", cleanupInvalidGrades);

// ── Early years (Creche / Nursery) ───────────────────────────────────────────
router.get("/early-years", protect, getEarlyYearsReport);
router.post("/early-years", protect, saveEarlyYearsReport);

export default router;
