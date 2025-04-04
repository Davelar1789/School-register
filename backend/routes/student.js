// routes/studentRoutes.js

import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
} from "../controllers/studentController.js";

const router = express.Router();

// CRUD routes
router.post("/", createStudent);
router.get("/", getAllStudents);
router.get("/search", searchStudents); // ?query=John
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
