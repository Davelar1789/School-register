// routes/teacherRoutes.js
import express from "express";
import { rateLimit } from "../middleware/rateLimit.js";
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
  getTeacherSubjects,
  getTeacherSubjects2,
  firstTimeSetup,
  patchTeachers} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you're using JWT middleware

const router = express.Router();

// All routes use protect if needed
router.post("/", createTeacher);
router.post("/verify-email", verifyTeacherEmail);   // Phase 1
router.post("/setup", rateLimit({ max: 15 }), firstTimeSetup);              // Phase 2
router.post("/login", rateLimit({ max: 15 }), loginTeacher);   
router.get("/teacher/teacher-classes", protect, getTeacherClasses);          
router.get("/school/:schoolId", getTeachersBySchool);
router.get("/:id", getTeacherById);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);
router.put("/:id/assign-classes", assignClassesToTeacher);
router.get("/:teacherId/subjects", getTeacherSubjects);
router.get("/:teacherId/subjects2", getTeacherSubjects2);
router.patch("/patch-teachers", patchTeachers);


export default router;
