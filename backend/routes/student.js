// routes/studentRoutes.js

import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentsBySchool,
  getStudentsByClass, 
  markAttendance,
  getAttendanceForToday,
  getAttendanceForClassOnDate,
  fetchWeeklyAttendance,
  markWeeklyAttendance,
  // deleteAllStudents,
  // migrateAttendanceBooleans,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you're using JWT middleware

const router = express.Router();

// CRUD routes
router.post("/", protect, createStudent);
router.get("/", protect, getAllStudents);
router.post("/mark-attendance", protect, markAttendance);
router.get("/search", searchStudents); // ?query=John
router.post("/fetch-attendance", getAttendanceForClassOnDate);
router.post("/fetch-weekly-attendance", protect, fetchWeeklyAttendance);
router.post("/mark-weekly-attendance", protect, markWeeklyAttendance);
// router.post("/migrate-attendance", migrateAttendanceBooleans);
// router.delete("/all-time", deleteAllStudents); // DELETE /api/students/all
router.get("/today/:studentId", getAttendanceForToday);
router.get("/class/:classId", protect, getStudentsByClass);
router.get("/:id", getStudentById);
router.get("/school/:schoolId", getStudentsBySchool);
router.put("/:id", updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;
