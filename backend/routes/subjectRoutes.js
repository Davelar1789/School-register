import express from "express";
import {
  createSubject,
  getSubjectsBySchool,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = express.Router();

router.post("/", createSubject);
router.get("/school/:schoolId", getSubjectsBySchool);
router.get("/:id", getSubjectById);
router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
