// routes/teacherRoutes.js
import express from "express";
import {
  createTeacher,
  getTeachersBySchool,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you're using JWT middleware

const router = express.Router();

// All routes use protect if needed
router.post("/", protect, createTeacher);
router.get("/school/:schoolId", protect, getTeachersBySchool);
router.get("/:id", protect, getTeacherById);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, deleteTeacher);

export default router;
