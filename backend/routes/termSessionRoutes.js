import express from "express";
import {
  getAcademicYears,
  getTermsByYear,
  addAcademicYear,
  saveTermSession,
  getTermFees,
  deleteTermSession,
  createTermSession,
  updateTermDates,
  getLatestTerm,
} from "../controllers/termSessionController.js";

const router = express.Router();

router.get("/years/:schoolId", getAcademicYears);
router.get("/:schoolId/:yearLabel", getTermsByYear);
router.post("/add-academic-year", addAcademicYear);
router.post("/create-term", createTermSession);
router.get("/latest/:schoolId", getLatestTerm); // ✅ New route for fetching latest term
router.patch('/update-term-dates/:termId', updateTermDates); // <-- Add this
router.post("/upsert-term/:termId", saveTermSession);
router.get("/fees/:schoolId/:yearLabel/:termName", getTermFees);
router.delete("/delete/:schoolId/:yearLabel/:termName", deleteTermSession); // optional

export default router;
