// routes/classRoutes.js
import express from "express";
import { createClass, patchStudentClasses, patchClassStudents, assignSubjectTeacher, getTotalFeedingPaid, recalculateClassesForSchool, updateTotalFeedingPaid, getSubjectsByClass, getClassesBySchool, getClassById, assignTeacherToClass, assignStudentToClass } from "../controllers/classController.js";

const router = express.Router();

// POST /api/classes/
router.post("/", createClass);
router.patch("/patch-classes", patchStudentClasses); 
router.patch("/classes/:classId/sync-students", patchClassStudents);
router.put("/update-feeding-total/:classId", updateTotalFeedingPaid);
router.get("/total-income/:schoolId", getTotalFeedingPaid);
router.patch("/recalculate-classes/:schoolId", recalculateClassesForSchool);
// GET /api/classes/school/:schoolId
router.get("/school/:schoolId", getClassesBySchool);
router.post('/assign-teacher', assignTeacherToClass);
router.post('/assign-student', assignStudentToClass);
router.get("/:id", getClassById);
router.get("/:id/subjects", getSubjectsByClass);
router.post("/assign-subject-teacher", assignSubjectTeacher);



export default router;
