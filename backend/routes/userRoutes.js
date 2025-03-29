import express from "express";
import { registerUser, loginUser, getUserProfile, getUserCount } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Import middleware


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile); // ✅ New route to fetch user details
router.get("/count", getUserCount);



export default router;
