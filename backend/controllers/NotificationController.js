import Notification from "../models/Notification.model.js";
import { io } from "../server.js"; // ✅ WebSocket integration

// A user may only act on their own notifications (super admins on anyone's)
export const isSelf = (req, res, next) => {
    const target = req.params.userId || req.params.teacherId;
    if (target && String(target) !== String(req.user._id) && req.user.role !== "superadmin") {
        return res.status(403).json({ message: "You can only access your own notifications." });
    }
    next();
};

// ✅ Create a new notification (supports multiple users & teachers)
export const createNotification = async (userIds = [], teacherIds = [], title, message, type) => {
    try {
        const notification = new Notification({ userIds, teacherIds, title, message, type });
        await notification.save();

        // ✅ Deliver only to the intended recipients' private rooms
        const rooms = [...userIds, ...teacherIds].map((id) => `user:${id}`);
        if (rooms.length) {
            io.to(rooms).emit("new-notification", {
                _id: notification._id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                createdAt: notification.createdAt,
            });
        }

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
        const notifications = await Notification.find({ teacherIds: req.params.teacherId })
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("❌ Error fetching notifications for teacher:", error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("❌ Error updating notification:", error);
        res.status(500).json({ message: "Error updating notification" });
    }
};

// ✅ Mark all notifications as read for a teacher
const forRecipient = (id) => ({ $or: [{ teacherIds: id }, { userIds: id }] });

export const markAllRead = async (req, res) => {
    const { teacherId } = req.params;
    try {
        await Notification.updateMany(
            { ...forRecipient(teacherId), readBy: { $ne: teacherId } },
            { $addToSet: { readBy: teacherId } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("❌ Error marking notifications as read:", error);
        res.status(500).json({ message: "Error updating notifications" });
    }
};

// ✅ Get unread notification count for a teacher
export const getUnreadCount = async (req, res) => {
    const { teacherId } = req.params;
    try {
        const unreadCount = await Notification.countDocuments({
            ...forRecipient(teacherId),
            readBy: { $ne: teacherId },
        });
        res.json({ count: unreadCount });
    } catch (error) {
        console.error("❌ Error fetching unread count:", error);
        res.status(500).json({ message: "Error fetching unread notifications count" });
    }
};

// ✅ Clear all notifications for a teacher
export const clearAllNotifications = async (req, res) => {
    const { teacherId } = req.params;
    try {
        await Notification.deleteMany(forRecipient(teacherId));
        res.json({ message: "All notifications cleared successfully." });
    } catch (error) {
        console.error("❌ Error clearing notifications:", error);
        res.status(500).json({ message: "Error clearing notifications." });
    }
};