import express from "express";
import { getUserNotifications, getTeacherNotifications, markAsRead, markAllRead, getUnreadCount } from "../controllers/NotificationController.js";

const router = express.Router();

router.get("/user/:userId", getUserNotifications); // ✅ Admin notifications
router.get("/teacher/:teacherId", getTeacherNotifications); // ✅ Teacher notifications
router.put("/read/:id", markAsRead); // ✅ Mark notification as read
router.put("/mark-all-read/:teacherId", markAllRead); // ✅ Mark all notifications as read
router.get("/unread-count/:teacherId", getUnreadCount); // ✅ Get unread notification count


export default router;