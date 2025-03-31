import React from "react";
import { FaHome, FaUser, FaCog, FaSchool, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar2.modules.css"; // Import global CSS

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar2 ${isOpen ? "open" : ""}`}>
      <button className="close-btn2" onClick={toggleSidebar}>&times;</button>
      <h2 className="sidebar-logo2">School Admin</h2>
      <ul className="sidebar-nav2">
        <li><FaHome /> Dashboard</li>
        <li><FaUser /> Profile</li>
        <li><FaSchool /> Schools</li>
        <li><FaCog /> Settings</li>
        <li className="sidebar-logout2"><FaSignOutAlt /> Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;
