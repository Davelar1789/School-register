// routes/general/student.js

import { Router } from "express";
import {
  getAllStudents,
  getStudentDetails,
  getStudentsByClass,
  getAllClasses,
  addSubjectToClass,
  saveStudentGrades,
  saveFees,
  getFeesData,
  saveAttendance,
  saveTermDetails, // Add this line
  getTermDetails // Add this line
} from "../../controllers/general/students/students.controller.js";

const router = Router();

router.get("/get-all-students", getAllStudents);
router.post("/student-details", getStudentDetails);
router.get("/get-students-by-class/:className", getStudentsByClass);
router.get("/get-all-classes", getAllClasses);
router.post("/add-subject-to-class", addSubjectToClass);
router.post("/save-student-grades", saveStudentGrades);
router.post("/save-fees", saveFees);
router.get("/get-fees-data", getFeesData);
router.post("/save-attendance", saveAttendance);
router.post("/save-term-details", saveTermDetails); // Add this line
router.get("/get-term-details", getTermDetails); // Add this line

export default router;
