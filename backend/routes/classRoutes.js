// routes/classRoutes.js
import express from "express";
import { createClass, getClassesBySchool, getClassById, assignTeacherToClass, assignStudentToClass } from "../controllers/classController.js";

const router = express.Router();

// POST /api/classes/
router.post("/", createClass);

// GET /api/classes/school/:schoolId
router.get("/school/:schoolId", getClassesBySchool);
router.post('/assign-teacher', assignTeacherToClass);
router.post('/assign-student', assignStudentToClass);
router.get("/:id", getClassById);


export default router;
