// routes/classRoutes.js
import express from "express";
import { createClass, patchStudentClasses, syncAllClassStudents, patchClassStudents, assignSubjectTeacher, assignSubjectTeacher2, getTotalFeedingPaid, restoreStudentClasses, recalculateClassesForSchool, updateTotalFeedingPaid, getSubjectsByClass, getClassesBySchool, getClassById, assignTeacherToClass, assignStudentToClass } from "../controllers/classController.js";

const router = express.Router();

// POST /api/classes/
router.post("/", createClass);
router.patch("/patch-classes", patchStudentClasses); 
router.patch("/sync-all-students", syncAllClassStudents);
router.put("/update-feeding-total/:classId", updateTotalFeedingPaid);
router.patch("/patch-class/:classId", patchClassStudents);
router.get("/total-income/:schoolId", getTotalFeedingPaid);
router.patch("/recalculate-classes/:schoolId", recalculateClassesForSchool);
// GET /api/classes/school/:schoolId
router.get("/school/:schoolId", getClassesBySchool);
router.post('/assign-teacher', assignTeacherToClass);
router.post('/assign-student', assignStudentToClass);
router.get("/:id", getClassById);
router.get("/:id/subjects", getSubjectsByClass);
router.post("/assign-subject-teacher", assignSubjectTeacher);
router.post("/assign-subject-teacher2", assignSubjectTeacher2);
router.put("/restore-classes/:schoolId", restoreStudentClasses);



export default router;
