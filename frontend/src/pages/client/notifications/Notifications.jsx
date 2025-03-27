import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import "./Notifications.modules.css";
import { toast } from "react-hot-toast";
import Side from "../../../components/Side2";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications/");
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch notifications");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="n-p">
     <Side />
     <div className="notifications-page">
      <h1 className="notifications-title">Notifications</h1>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <p className="no-notifications">You have no notifications.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li key={notification._id} className="notification-item">
              <div className="notification-header">
                <h2>{notification.title}</h2>
                <span className="notification-date">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p>{notification.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
    
  );
};

export default Notifications;
