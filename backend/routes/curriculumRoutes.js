// ─────────────────────────────────────────────────────────────
// Add these routes to your existing teacher/curriculum router
// ─────────────────────────────────────────────────────────────

import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // your auth middleware
import { getTeacherSubjectsForClass } from "../controllers/curriculumController.js";
import { getCurriculum } from "../controllers/curriculumController.js";

const router = express.Router();

// GET /api/teachers/:teacherId/subjects2?classId=<classId>
// Used by Curriculum page to fetch subjects for a selected class
router.get(
  "/teachers/:teacherId/subjects2",
  protect,
  getTeacherSubjectsForClass
);

// GET /api/curriculum/:subjectId/:classId
// Used by Curriculum page to fetch curriculum for a subject in a class
router.get(
  "/curriculum/:subjectId/:classId",
  protect,
  getCurriculum
);

export default router;
