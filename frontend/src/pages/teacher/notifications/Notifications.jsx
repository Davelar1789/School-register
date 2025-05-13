import { useEffect, useState } from "react";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";
import socket from "../../../components/Teacher/Socket"; // ✅ Import the persistent socket instance

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

   useEffect(() => {
    socket.on("connect", () => {
        console.log("✅ WebSocket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log(`❌ WebSocket disconnected: ${reason}`);
    });

    socket.on("new-notification", (notification) => {
        console.log("🔔 Notification received:", notification);
        setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
        socket.off("new-notification");
    };
}, []);


       
    return (
        <div>
            <Sidebar />
            <Header />
        <div className="main-thing">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                notifications.map((notif, index) => (
                    <div key={index}>
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                    </div>
                ))
            )}

        </div>
                </div>

    );
};

export default NotificationsPage;