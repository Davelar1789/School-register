import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import "./Notifications.modules.css";

const socket = io("https://school-register6.onrender.com"); // ✅ Replace with your actual backend URL

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        socket.on("new-notification", (notification) => {
            console.log("🔔 New notification received:", notification);
            setNotifications((prev) => [notification, ...prev]); // ✅ Add new notifications to list
        });

        return () => {
            socket.off("new-notification"); // ✅ Clean up listener on unmount
        };
    }, []);

    return (
        <div>
            <Sidebar />
            <Header />

        <div>
            <h2>Notifications</h2>
            {notifications.map((notif, index) => (
                <div key={index} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                </div>
            ))}
        </div>
                </div>

    );
};

export default NotificationsPage;