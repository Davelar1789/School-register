import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ Import for decoding the token
import axios from "../../../api/axios";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Notifications.modules.css";
import socket from "../../../components/Teacher/Socket"; // ✅ Persistent WebSocket connection
import NotificationTutorial from "../../../components/Teacher/NotificationTutorial"; // ✅ Tutorial component
import { useLocation } from "react-router-dom";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [showTutorial, setShowTutorial] = useState(false); // ✅ Tracks tutorial visibility
        const location = useLocation();

    // ✅ Retrieve teacher ID & tutorial status from JWT token
    const getTeacherData = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            const decodedToken = jwtDecode(token);
            return {
                id: decodedToken?.id || null,
                seenTutorial: decodedToken?.seenTutorial || false
            };
        } catch (error) {
            console.error("❌ Error decoding token:", error);
            return null;
        }
    };

    const teacherData = getTeacherData();
    const teacherId = teacherData?.id;

    // ✅ Fetch stored notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!teacherId) {
                console.warn("⚠️ Teacher ID not found. Skipping notification fetch.");
                return;
            }

            try {
                const response = await axios.get(`/api/notification/teacher/${teacherId}`);
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

    // ✅ Show tutorial if teacher hasn't seen it yet
    useEffect(() => {
        if (!teacherData?.seenTutorial) {
            setShowTutorial(true);
        }
    }, [teacherData]);

    // ✅ Mark tutorial as seen in backend
    const handleTutorialComplete = async () => {
        try {
            await axios.put(`/api/tutorials/mark-seen/${teacherId}`);
            setShowTutorial(false); // ✅ Hide tutorial after marking it as seen
        } catch (error) {
            console.error("❌ Error marking tutorial as seen:", error);
        }
    };

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
            await axios.delete(`/api/notification/clear-all/${teacherId}`);
            setNotifications([]); // ✅ Clear notifications in the UI immediately
            console.log("✅ All notifications cleared!");
        } catch (error) {
            console.error("❌ Error clearing notifications:", error);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("startTutorial") === "true") {
            setTimeout(() => setShowTutorial(true), 500); // ✅ Delay start to ensure the first step closed
        }
    }, [location]);

    return (
        <div>
            <Sidebar />
            <Header />

            {/* ✅ Show tutorial only when needed */}
            {/* {showTutorial && <NotificationTutorial isOpen={showTutorial} step="notifications" onComplete={handleTutorialComplete} />} */}
            {showTutorial && <NotificationTutorial isOpen={showTutorial} step="notifications" />}
            <div className="main-thing">
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
