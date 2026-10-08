import express from "express";
import { getUserNotifications, getTeacherNotifications, markAsRead, markAllRead, getUnreadCount, clearAllNotifications, isSelf } from "../controllers/NotificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route needs a signed-in user, and users only ever see their own notifications.
router.use(protect);

router.get("/user/:userId", isSelf, getUserNotifications); // Admin notifications
router.get("/teacher/:teacherId", isSelf, getTeacherNotifications); // Teacher notifications
router.put("/read/:id", markAsRead); // Mark one notification as read
router.put("/mark-all-read/:teacherId", isSelf, markAllRead); // Mark all as read (admin or teacher id)
router.get("/unread-count/:teacherId", isSelf, getUnreadCount); // Unread count (admin or teacher id)
router.delete("/clear-all/:teacherId", isSelf, clearAllNotifications); // Clear everything for one recipient

export default router;
