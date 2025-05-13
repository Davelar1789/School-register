import { useEffect, useState } from "react";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";
import socket from "../../../components/Teacher/Socket"; // ✅ Import the persistent socket instance

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        socket.on("new-notification", (notification) => {
            console.log("🔔 Notification received in frontend:", notification);
            setNotifications((prev) => [notification, ...prev]); // ✅ Store notifications persistently
        });

        return () => {
            socket.off("new-notification"); // ✅ Prevent multiple listeners on re-renders
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