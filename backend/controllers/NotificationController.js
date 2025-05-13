import Notification from "../models/Notification.model.js";
import { io } from "../server.js"; // ✅ WebSocket integration

// ✅ Create a new notification (supports multiple users & teachers)
export const createNotification = async (userIds = [], teacherIds = [], title, message, type) => {
    try {
        const notification = new Notification({ userIds, teacherIds, title, message, type });
        await notification.save();

        // ✅ Emit real-time notifications
        io.emit("new-notification", { userIds, teacherIds, title, message, type });

        console.log(`🔔 Notification sent in real-time for ${userIds.length} admins & ${teacherIds.length} teachers: ${title}`);
        return notification;
    } catch (error) {
        console.error("❌ Error creating notification:", error);
        throw error;
    }
};

// ✅ Get notifications for a specific admin (user)
export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userIds: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("❌ Error fetching notifications for user:", error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// ✅ Get notifications for a specific teacher
export const getTeacherNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ teacherIds: req.params.teacherId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("❌ Error fetching notifications for teacher:", error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.body.userId } });
        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("❌ Error updating notification:", error);
        res.status(500).json({ message: "Error updating notification" });
    }
};