import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import "./ManageNotices.modules.css";
import { toast } from "react-hot-toast";
import Side from "../../../components/Side2";

const ManageNotices = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("all"); // "all" or specific usernames
  const [specificUsers, setSpecificUsers] = useState([]); // Array of specific usernames
  const [usernameQuery, setUsernameQuery] = useState("");
  const [userOptions, setUserOptions] = useState([]); // Options for usernames
  const [loading, setLoading] = useState(false);

  // Fetch usernames for the dropdown
  useEffect(() => {
    if (recipients === "specific" && usernameQuery) {
      const fetchUsernames = async () => {
        try {
          const response = await axios.get(`/api/users/search?query=${usernameQuery}`);
          setUserOptions(response.data);
        } catch (error) {
          console.error("Error fetching usernames:", error);
        }
      };

      fetchUsernames();
    }
  }, [recipients, usernameQuery]);

  const sendNotification = async () => {
    if (!title || !message) {
      toast.error("Title and message are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/notifications/send", {
        title,
        message,
        recipients: recipients === "all" ? "all" : specificUsers,
      });
      toast.success("Notification sent successfully!");
      setTitle("");
      setMessage("");
      setSpecificUsers([]);
    } catch (error) {
      toast.error("Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-np">
      <Side />
      <div className="manage-notices-page">
        <h1 className="m-n1">Manage Notifications</h1>
        <div className="notification-form-container">
          <label className="notification-label">Title</label>
          <input
            type="text"
            className="notification-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
          />
          <label className="notification-label">Message</label>
          <textarea
            className="notification-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
          />
          <label className="notification-label">Recipients</label>
          <select
            className="notification-select"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="specific">Specific Users (search usernames)</option>
          </select>
          {recipients === "specific" && (
            <div className="specific-users-section">
              <input
                type="text"
                className="notification-username-search"
                placeholder="Search usernames"
                value={usernameQuery}
                onChange={(e) => setUsernameQuery(e.target.value)}
              />
              {userOptions.length > 0 && (
                <ul className="user-options-list">
                  {userOptions.map((user) => (
                    <li
                      key={user.id}
                      className="user-option-item"
                      onClick={() =>
                        setSpecificUsers((prev) =>
                          prev.includes(user.username)
                            ? prev
                            : [...prev, user.username]
                        )
                      }
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
              )}
              <div className="selected-users">
                {specificUsers.map((user) => (
                  <span key={user} className="selected-user-badge">
                    {user}
                    <button
                      className="remove-user-button"
                      onClick={() =>
                        setSpecificUsers((prev) => prev.filter((u) => u !== user))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            className="notification-submit-button"
            onClick={sendNotification}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageNotices;
