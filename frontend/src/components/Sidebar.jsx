import React from "react";
import { FaHome, FaUser, FaCog, FaSchool, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // Import Axios for API call
import "./Sidebar.modules.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>&times;</button>
      <h2 className="sidebar-logo">School Admin</h2>
      <ul className="sidebar-nav">
        <li><FaHome /> Dashboard</li>
        <li><FaUser /> Profile</li>
        <li><FaSchool /> Students</li>
        <li><FaSchool /> Teachers</li>
        <li><FaCog /> Settings</li>
        <li className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
