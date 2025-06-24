import express from "express";
import {
  createSubject,
  getSubjectsBySchool,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsByClass,
  updateCourseMaterials,
} from "../controllers/subjectController.js";

const router = express.Router();

router.post("/", createSubject);
router.get("/class/:classId", getSubjectsByClass);
router.put("/:subjectId/materials", updateCourseMaterials);
router.get("/school/:schoolId", getSubjectsBySchool);
router.get("/:id", getSubjectById);
router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
