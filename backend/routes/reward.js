import express from "express";
import User from "../models/User.model.js"; // Assuming User model is in the same directory as before
import { authToken } from "../middleware/authToken.js";


const router = express.Router();

// Claim daily reward route handler
const claimDailyReward = async (req, res) => {
  try {
    const userId = req.userId; // Use req.userId as set by the middleware
    console.log("User ID:", userId); // Debugging log

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison

    console.log("Last reward claim date:", user.lastRewardClaimDate);
    console.log("Today's date:", today);

    if (
      user.lastRewardClaimDate &&
      new Date(user.lastRewardClaimDate).getTime() === today.getTime()
    ) {
      console.warn("Reward already claimed for today");
      return res
        .status(400)
        .json({ message: "Reward already claimed for today" });
    }

    // Update user XP and set lastRewardClaimDate
    user.stats.xp += 50; // Add reward XP
    user.lastRewardClaimDate = today;

    console.log("New XP:", user.stats.xp);

    await user.save();
    res
      .status(200)
      .json({ message: "Reward claimed successfully", newXp: user.stats.xp });
  } catch (error) {
    console.error("Error claiming reward:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred while claiming the reward" });
  }
};



// Define the route
router.post("/claim-reward", authToken, claimDailyReward);

export default router;
