import express from "express";
import { getUserNotifications, getTeacherNotifications, markAsRead } from "../controllers/NotificationController.js";

const router = express.Router();

router.get("/user/:userId", getUserNotifications); // ✅ Admin notifications
router.get("/teacher/:teacherId", getTeacherNotifications); // ✅ Teacher notifications
router.put("/read/:id", markAsRead); // ✅ Mark notification as read

export default router;