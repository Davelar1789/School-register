import { useEffect, useState } from "react";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";
import socket from "../../../components/Teacher/Socket"; // ✅ Import the persistent socket instance

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        console.log("✅ Listening for notifications...");
        
        socket.on("connect", () => {
            console.log("✅ Frontend connected to WebSocket!");
        });

        socket.on("disconnect", () => {
            console.log("❌ Frontend disconnected from WebSocket!");
        });

        socket.on("new-notification", (notification) => {
            console.log("🔔 Notification received:", notification);
            setNotifications((prev) => [notification, ...prev]); // ✅ Store notifications persistently
        });

        return () => {
            socket.off("new-notification"); // ✅ Prevent multiple listeners
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