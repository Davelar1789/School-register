import express from "express";
import {
  getAcademicYears,
  getTermsByYear,
  addAcademicYear,
  upsertTermSession,
  getTermFees,
  deleteTermSession,
} from "../controllers/termSessionController.js";

const router = express.Router();

router.get("/years/:schoolId", getAcademicYears);
router.get("/terms/:schoolId/:yearLabel", getTermsByYear);
router.post("/add-academic-year", addAcademicYear);
router.post("/upsert-term", upsertTermSession);
router.get("/fees/:schoolId/:yearLabel/:termName", getTermFees);
router.delete("/delete/:schoolId/:yearLabel/:termName", deleteTermSession); // optional

export default router;
