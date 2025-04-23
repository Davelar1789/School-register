// routes/teacherRoutes.js
import express from "express";
import {
  createTeacher,
  getTeachersBySchool,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  verifyTeacherEmail,
  assignClassesToTeacher,
  getTeacherClasses,
  firstTimeSetup} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you're using JWT middleware

const router = express.Router();

// All routes use protect if needed
router.post("/", createTeacher);
router.post("/verify-email", verifyTeacherEmail);   // Phase 1
router.post("/setup", firstTimeSetup);              // Phase 2
router.post("/login", loginTeacher);                // Phase 3
router.get("/school/:schoolId", getTeachersBySchool);
router.get("/:id", getTeacherById);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);
router.put("/:id/assign-classes", assignClassesToTeacher);
router.get("/teacher-classes", getTeacherClasses);



export default router;
