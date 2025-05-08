// routes/classRoutes.js
import express from "express";
import { createClass, patchStudentClasses, recalculateClassesForSchool, getSubjectsByClass, getClassesBySchool, getClassById, assignTeacherToClass, assignStudentToClass } from "../controllers/classController.js";

const router = express.Router();

// POST /api/classes/
router.post("/", createClass);
router.patch("/patch-classes", patchStudentClasses); 
router.patch("/recalculate-classes/:schoolId", recalculateClassesForSchool);
// GET /api/classes/school/:schoolId
router.get("/school/:schoolId", getClassesBySchool);
router.post('/assign-teacher', assignTeacherToClass);
router.post('/assign-student', assignStudentToClass);
router.get("/:id", getClassById);
router.get("/:id/subjects", getSubjectsByClass);


export default router;
