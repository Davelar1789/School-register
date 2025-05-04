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
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js"; // if you're using JWT middleware

const router = express.Router();

// CRUD routes
router.post("/", protect, createStudent);
router.get("/", protect, getAllStudents);
router.get("/search", searchStudents); // ?query=John
router.get("/class/:classId", protect, getStudentsByClass);
router.post("/mark-attendance", markAttendance);
router.get("/:id", getStudentById);
router.get("/school/:schoolId", getStudentsBySchool);
router.put("/:id", updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;
