import express from "express";
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
  saveTermDetails,
  getTermDetails,
  addStudents,
  editStudent,
  deleteStudent
} from "../controllers/studentController.js";

const router = express.Router();

// Student Management
router.post("/manage-students/add", addStudents);
router.post("/manage-students/delete", deleteStudent);
router.put("/manage-students/edit", editStudent);

// Student Queries
router.get("/get-all-students", getAllStudents);
router.post("/student-details", getStudentDetails);
router.get("/get-students-by-class/:className", getStudentsByClass);

// Class Management
router.get("/get-all-classes", getAllClasses);
router.post("/add-subject-to-class", addSubjectToClass);

// Grades and Fees
router.post("/save-student-grades", saveStudentGrades);
router.post("/save-fees", saveFees);
router.get("/get-fees-data", getFeesData);

// Attendance & Term Info
router.post("/save-attendance", saveAttendance);
router.post("/save-term-details", saveTermDetails);
router.get("/get-term-details", getTermDetails);

export default router;
