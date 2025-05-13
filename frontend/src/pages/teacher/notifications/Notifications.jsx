import { useEffect, useState } from "react";
import axios from "axios"; // ✅ Fetch notifications from backend
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";
import socket from "../../../components/Teacher/Socket"; // ✅ Persistent WebSocket connection

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    // ✅ Retrieve teacher ID from local storage
    const getTeacherId = () => {
        try {
            const teacherData = JSON.parse(localStorage.getItem("teacher"));
            return teacherData?.id || null; // ✅ Ensure it's valid
        } catch (error) {
            console.error("❌ Error retrieving teacher ID:", error);
            return null;
        }
    };

    const teacherId = getTeacherId();

    // ✅ Fetch stored notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!teacherId) {
                console.warn("⚠️ Teacher ID not found. Skipping notification fetch.");
                return;
            }

            try {
                const response = await axios.get(`https://school-register-a2bx.onrender.com/api/notification/teacher/${teacherId}`);
                console.log("🔎 Fetched notifications:", response.data);

                if (Array.isArray(response.data)) {
                    setNotifications(response.data);
                } else {
                    console.warn("⚠️ Unexpected API response format:", response.data);
                    setNotifications([]); // ✅ Default to empty array to prevent errors
                }
            } catch (error) {
                console.error("❌ Error fetching notifications:", error);
                setNotifications([]); // ✅ Prevents crashes on fetch failure
            }
        };

        fetchNotifications();
    }, [teacherId]);

    // ✅ WebSocket Listener for Real-Time Notifications
    useEffect(() => {
        socket.on("connect", () => console.log("✅ WebSocket connected:", socket.id));
        socket.on("disconnect", (reason) => console.warn(`❌ WebSocket disconnected: ${reason}`));

        socket.on("new-notification", (notification) => {
            console.log("🔔 Real-Time Notification:", notification);
            setNotifications((prev) => [notification, ...prev]); // ✅ Merge new notifications
        });

        return () => {
            socket.off("new-notification"); // ✅ Cleanup on unmount
        };
    }, []);
// ✅ Function to clear all notifications for the teacher
    const handleClearAll = async () => {
        if (!teacherId) return;
        
        try {
            await axios.delete(`https://school-register-a2bx.onrender.com/api/notification/clear-all/${teacherId}`);
            setNotifications([]); // ✅ Clear notifications in the UI immediately
            console.log("✅ All notifications cleared!");
        } catch (error) {
            console.error("❌ Error clearing notifications:", error);
        }
    };

    return (
        <div>
            <Sidebar />
            <Header />
            <div className="main-thing">
                <h2>📢 Notifications</h2>
                 <div className="notifications-header">
                    <h2>📢 Notifications</h2>
                    {notifications.length > 0 && (
                        <button className="clear-all-btn" onClick={handleClearAll}>
                            Clear All
                        </button>
                    )}
                </div>
                {notifications.length === 0 ? (
                    <p>No new notifications</p>
                ) : (
                    notifications.map((notif, index) => (
                        <div key={index} className="notification-card">
                            <strong className="notification-title">{notif.title}</strong>
                            <p className="notification-message">{notif.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;