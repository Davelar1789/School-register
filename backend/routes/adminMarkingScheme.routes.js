import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";
import uploadMarkingScheme from "../config/cloudinaryMarkingScheme.js";
import {
  uploadScheme,
  updateScheme,
  deleteScheme,
  getAllSchemesForSchool,
} from "../controllers/markingScheme.controller.js";

const router = express.Router();

router.get("/", protectAdmin, getAllSchemesForSchool);
router.post("/upload", protectAdmin, uploadMarkingScheme.single("file"), uploadScheme);
router.put("/:id", protectAdmin, uploadMarkingScheme.single("file"), updateScheme);
router.delete("/:id", protectAdmin, deleteScheme);

export default router;