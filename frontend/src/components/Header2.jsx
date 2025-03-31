import React from "react";
import { FaBell, FaEnvelope, FaCog, FaUser, FaSearch } from "react-icons/fa";
import "./Header.modules.css";

const Header = () => {
  return (
    <header className="header">
      {/* Left Section: Menu Icon & Welcome */}
      <div className="header-left">
        <div className="menu-icon">
          <span className="bar long"></span>
          <span className="bar long"></span>
          <span className="bar short"></span>
        </div>
        <span className="welcome-text">Welcome</span>
      </div>

      {/* Center: Search Bar */}
      <div className="search-container">
        <input type="text" placeholder="Search here..." className="search-input" />
        <FaSearch className="search-icon" />
      </div>

      {/* Right Section: Icons & Language Switcher */}
      <div className="header-right">
        <FaBell className="icon" />
        <FaEnvelope className="icon" />
        <FaCog className="icon" />
        <FaUser className="icon" />
        <select className="language-switcher">
          <option>ENGLISH</option>
          <option>FRENCH</option>
          <option>SPANISH</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
