import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";

const socket = io("https://school-register-a2bx.onrender.com"); // ✅ Replace with your actual backend URL

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        socket.on("new-notification", (notification) => {
            console.log("🔔 Notification received in frontend:", notification); // ✅ Debugging log
            setNotifications((prev) => [notification, ...prev]);
        });

        return () => {
            socket.off("new-notification"); // ✅ Cleanup WebSocket listener
        };
    }, []);

    return (
        <div>
            <Sidebar />
            <Header />
        <div className="main-thing">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p className="empty-message">No new notifications</p>
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