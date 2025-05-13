import { useEffect, useState } from "react";
import axios from "axios"; // ✅ Fetch notifications from backend
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";
import socket from "../../../components/Teacher/Socket"; // ✅ Persistent WebSocket connection

const NotificationsPage = ({ teacherId }) => { // ✅ Pass teacherId for fetching
    const [notifications, setNotifications] = useState([]);

    // ✅ Fetch stored notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`/api/notifications/teacher/${teacherId}`);
                setNotifications(response.data);
            } catch (error) {
                console.error("❌ Error fetching notifications:", error);
            }
        };

        fetchNotifications(); // ✅ Load notifications when page mounts
    }, [teacherId]);

    // ✅ WebSocket Listener for Real-Time Notifications
    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ WebSocket connected:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.log(`❌ WebSocket disconnected: ${reason}`);
        });

        socket.on("new-notification", (notification) => {
            console.log("🔔 Real-Time Notification:", notification);
            setNotifications((prev) => [notification, ...prev]); // ✅ Merge new notifications
        });

        return () => {
            socket.off("new-notification"); // ✅ Cleanup on unmount
        };
    }, []);

    return (
        <div>
            <Sidebar />
            <Header />
            <div className="main-thing">
                <h2>📢 Notifications</h2>
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