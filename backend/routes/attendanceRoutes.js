import express from "express";
import { markAttendance, fetchAttendance, updateAttendance, markAttendanceBatch, fetchStudentAttendance, fetchTotalFeesBySchoolView, getFeedingDaily, getFeedingWeekly, getFeedingMonthly } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance); // Mark attendance
router.post("/mark-batch", markAttendanceBatch);
router.get("/fetch", fetchAttendance); // Fetch attendance (by term, class, or student)
router.get("/student-total", fetchStudentAttendance);
router.get("/feeding/total-school/:schoolId", fetchTotalFeesBySchoolView);
router.put("/update/:attendanceId", updateAttendance); // Update attendance
router.get("/feeding/daily", getFeedingDaily);
router.get("/feeding/weekly", getFeedingWeekly);
router.get("/feeding/monthly", getFeedingMonthly);

export default router;