import express from "express";
import { registerSchool, getAllSchools, getSchoolById, updateSchool, deleteSchool } from "../controllers/schoolController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", protect, registerSchool);
router.get("/", getAllSchools);
router.get("/:id", getSchoolById);
router.put("/:id", updateSchool);
router.delete("/:id", deleteSchool);

export default router;
