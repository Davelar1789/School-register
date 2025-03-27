import Notification from "../../models/Notification.model.js";

// Fetch notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId; // Assuming user ID is available in the request
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Create a new notification (Admin/Instructor feature)
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const notification = new Notification({ userId, title, message });
    await notification.save();

    res.status(201).json({ message: "Notification created successfully" });
  } catch (error) {
    console.error("Error creating notification:", error.message);
    res.status(500).json({ message: "Failed to create notification" });
  }
};
