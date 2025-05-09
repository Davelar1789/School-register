import express from "express";
import { markAttendance, fetchAttendance, updateAttendance, markAttendanceBatch, fetchStudentAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance); // Mark attendance
router.post("/mark-batch", markAttendanceBatch);
router.get("/fetch", fetchAttendance); // Fetch attendance (by term, class, or student)
router.get("/student-total", fetchStudentAttendance);
router.put("/update/:attendanceId", updateAttendance); // Update attendance

export default router;