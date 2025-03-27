import express from 'express';
import User from '../models/User.model.js'; // Ensure the User model is imported correctly
import { authToken } from '../middleware/authToken.js'; // Import the authentication middleware

const router = express.Router();

/**
 * Update Profile Endpoint
 */
router.put('/update-profile', authToken, async (req, res) => {
  const { username, email, phone, location, stats } = req.body; // Add stats to destructure
  const userId = req.userId; // Use `req.userId` from authToken middleware

  try {
    // Check if the new username is already taken by another user
    const existingUser = await User.findOne({ username });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        username, 
        email, 
        phone, 
        location,
        ...(stats && { stats }) // Only update stats if provided
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get Leaderboard Rank Endpoint
 */
router.get('/rank', authToken, async (req, res) => {
  try {
    const userId = req.userId; // Assuming userId is set by authToken middleware

    // Fetch all users sorted by XP in descending order
    const allUsers = await User.find({}, { _id: 1, "stats.xp": 1 })
      .sort({ "stats.xp": -1 })
      .exec();

    // Find the rank of the current user
    const rank = allUsers.findIndex(user => user._id.toString() === userId) + 1;

    if (rank === 0) {
      return res.status(404).json({ message: "User not found in the leaderboard" });
    }

    res.status(200).json({
      rank,
      totalUsers: allUsers.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard rank:', error.message);
    res.status(500).json({ message: 'Failed to fetch rank.' });
  }
});

export default router;
