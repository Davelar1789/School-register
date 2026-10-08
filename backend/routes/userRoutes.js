import express from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { registerUser, loginUser, getUserProfile, getUserCount, logoutUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Import middleware


const router = express.Router();

router.post("/register", rateLimit({ max: 15 }), registerUser);
router.post("/login", rateLimit({ max: 15 }), loginUser);
router.get("/profile", protect, getUserProfile); // ✅ New route to fetch user details
router.get("/count", getUserCount);
router.post("/logout", logoutUser);



export default router;
