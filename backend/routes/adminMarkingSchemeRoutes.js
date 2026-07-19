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

router.get("/", getAllSchemesForSchool);
router.post("/upload", uploadMarkingScheme.single("file"), uploadScheme);
router.put("/:id", uploadMarkingScheme.single("file"), updateScheme);
router.delete("/:id", deleteScheme);

export default router;