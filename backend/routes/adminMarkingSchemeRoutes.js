import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import uploadMarkingScheme from "../config/cloudinaryMarkingScheme.js";
import {
  uploadScheme,
  updateScheme,
  deleteScheme,
  getAllSchemesForSchool,
} from "../controllers/markingScheme.controller.js";

const router = express.Router();

router.get("/", protect, getAllSchemesForSchool);
router.post("/upload", protect, uploadMarkingScheme.single("file"), uploadScheme);
router.put("/:id", protect, uploadMarkingScheme.single("file"), updateScheme);
router.delete("/:id", protect, deleteScheme);

export default router;