import express from "express";
import { markAttendance, fetchAttendance, updateAttendance, markAttendanceBatch } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance); // Mark attendance
router.post("/mark-batch", markAttendanceBatch);
router.get("/fetch", fetchAttendance); // Fetch attendance (by term, class, or student)
router.put("/update/:attendanceId", updateAttendance); // Update attendance

export default router;