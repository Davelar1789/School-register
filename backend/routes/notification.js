import express from "express";
import { authToken } from "../middleware/authToken.js";
import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

const router = express.Router();

// Admin sends a notification
router.post("/send", authToken, async (req, res) => {
  try {
    const { userId } = req; // The sender (assume admin validation is handled elsewhere)
    const { title, message, recipients } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    let recipientIds = [];
    if (recipients === "all") {
      const allUsers = await User.find({}, "_id");
      recipientIds = allUsers.map((user) => user._id);
    } else {
      recipientIds = await User.find({ username: { $in: recipients } }, "_id");
    }

    const notification = await Notification.create({
      userId, // Admin sending the notification
      title,
      message,
      recipients: recipientIds.map((user) => user._id),
    });

    res.status(200).json({
      message: "Notification sent successfully.",
      notification,
    });
  } catch (error) {
    console.error("Error sending notification:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch notifications for the logged-in user
router.get("/", authToken, async (req, res) => {
  try {
    const { userId } = req;

    const notifications = await Notification.find({
      $or: [{ userId }, { recipients: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name email") // Optional: Populate admin details
      .populate("recipients", "name email"); // Optional: Populate recipient details

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Mark a notification as read
router.patch("/:id/read", authToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification marked as read.", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Search for usernames (New Route)
router.get("/search", authToken, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query is required." });
  }

  try {
    const users = await User.find({ username: { $regex: query, $options: "i" } }).select(
      "username _id"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching for usernames:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
