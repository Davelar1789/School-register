import express from "express";
import { registerSchool, getAllSchools, getSchoolById, updateSchool, deleteSchool, getSchoolByUserId } from "../controllers/schoolController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", protect, registerSchool);
router.get("/", protect, getAllSchools); // Get all schools
router.get("/user/:userId", protect, getSchoolByUserId);
router.get("/:id", protect, getSchoolById);
router.put("/:id", protect, updateSchool);
router.delete("/:id", protect, isSuperAdmin, deleteSchool);


export default router;
