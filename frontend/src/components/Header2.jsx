import React, { useState, useEffect } from "react";
import { FaBell, FaEnvelope, FaCog, FaUser, FaSearch } from "react-icons/fa";
import "./Header2.modules.css";

const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header2">
      {/* Left Section: Menu Icon & Welcome */}
      <div className="header-left">
        <div className="menu-icon">
          <span className="bar long"></span>
          <span className="bar long"></span>
          <span className="bar short"></span>
        </div>
        {windowWidth > 600 && <span className="welcome-text">Welcome</span>}
      </div>

      {/* Center: Search Bar (Hidden on smaller screens) */}
      {windowWidth > 900 && (
        <div className="search-container">
          <input type="text" placeholder="Search here..." className="search-input" />
          <FaSearch className="search-icon" />
        </div>
      )}

      {/* Right Section: Icons & Language Switcher */}
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
  );
};

export default Header;
