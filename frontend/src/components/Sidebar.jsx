import React from "react";
import { FaHome, FaUser, FaCog, FaSchool, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.modules.css"; // Import global CSS

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
        <li className="sidebar-logout"><FaSignOutAlt /> Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;
