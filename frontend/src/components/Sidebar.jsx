import React, { useState, useEffect } from "react";
import { FaHome, FaUser, FaCog, FaSchool, FaSignOutAlt, FaArrowLeft, FaBars } from "react-icons/fa";
import "./Sidebar.modules.css"; // Import global CSS

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);
  const [sidebarOpen, setSidebarOpen] = useState(isLargeScreen);

  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth > 768;
      setIsLargeScreen(isLarge);
      setSidebarOpen(isLarge); // Keep sidebar open on large screens
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {!isLargeScreen && (
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}

      <div className={`sidebar ${sidebarOpen ? "open" : ""} ${isLargeScreen ? "large" : ""}`}>
        {!isLargeScreen ? (
          <button className="close-btn" onClick={toggleSidebar}>&times;</button>
        ) : (
          <button className="collapse-btn" onClick={handleToggle}>
            <FaArrowLeft />
          </button>
        )}

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
    </>
  );
};

export default Sidebar;
