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
router.post("/", createTeacher);
router.get("/school/:schoolId", getTeachersBySchool);
router.get("/:id", getTeacherById);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, deleteTeacher);

export default router;
