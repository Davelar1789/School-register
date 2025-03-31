import React from "react";
import { FaHome, FaUser, FaCommentDots, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // Import Axios for API call
import "./Sidebar.modules.css";

const Sidebar = ({ schoolName = "AdminSchool" }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/users/logout"); // Call the backend logout route
      localStorage.removeItem("token"); // Remove token from storage
      localStorage.removeItem("user"); // Remove user data
      navigate("/sign-in"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-circle">{schoolName.charAt(0)}</div>
        <div className="school-name">{schoolName}</div>
      </div>

      {/* User Profile */}
      <div className="sidebar-profile">
        <img src="/path-to-profile-image.jpg" alt="User" className="profile-img" />
        <div className="profile-info">
          <h3>Zack Foster</h3>
          <p>Admin</p>
        </div>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-nav">
        <li><FaHome className="icon" /> Dashboard</li>
        <li><FaCommentDots className="icon" /> Chat</li>
        <li className="menu-item">
          <FaUsers className="icon" /> Student
          <span className="counter-badge">35</span>
        </li>
        <li><FaUser className="icon" /> Teacher</li>
        <li><FaCalendarAlt className="icon" /> Event</li>
      </ul>
    </div>
  );
};

export default Sidebar;
