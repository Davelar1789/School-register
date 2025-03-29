import express from "express";
import { 
  getPendingSchools, 
  getApprovedSchools, 
  approveSchool, 
  rejectSchool 
} from "../controllers/schoolController.js";

import { getUserCount } from "../controllers/userController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all pending schools (for SuperAdmin)
router.get("/pending", protect, isSuperAdmin, getPendingSchools);

// Get all approved schools
router.get("/approved", protect, isSuperAdmin, getApprovedSchools);

// Approve a school
router.put("/approve/:id", protect, isSuperAdmin, approveSchool);

// Reject a school
router.delete("/reject/:id", protect, isSuperAdmin, rejectSchool);

// Get total user count
router.get("/users/count", protect, isSuperAdmin, getUserCount);

export default router;
