import React, { useState, useEffect } from "react";
import { FaBell, FaEnvelope, FaCog, FaUser, FaSearch } from "react-icons/fa";
import Sidebar from "./Sidebar"; // Import the sidebar here
import "./Header2.modules.css";

const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 974) {
        setSidebarOpen(false); // Auto-close sidebar on large screens
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <>
      <header className="header2">
        <div className="header-left">
          <div className="menu-icon" onClick={toggleSidebar}>
            <span className="bar long"></span>
            <span className="bar long"></span>
            <span className="bar short"></span>
          </div>
          <span className="welcome-text">Welcome</span>
        </div>

        {windowWidth > 900 && (
          <div className="search-container">
            <input type="text" placeholder="Search here..." className="search-input" />
            <FaSearch className="search-icon" />
          </div>
        )}

        <div className="header-right">
          <FaBell className="icon" />
          {windowWidth > 768 && <FaEnvelope className="icon" />}
          {windowWidth > 768 && <FaCog className="icon" />}
          <FaUser className="icon" />
          {windowWidth > 1024 && (
            <select className="language-switcher">
              <option>ENGLISH</option>
              <option>FRENCH</option>
              <option>SPANISH</option>
            </select>
          )}
        </div>
      </header>

      {/* Sidebar overlay on smaller screens */}
      {windowWidth <= 974 && sidebarOpen && (
        <div className="mobile-sidebar">
          <Sidebar />
        </div>
      )}
    </>
  );
};

export default Header;
