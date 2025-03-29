import React from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import "./Header2.modules.css"; // Import global CSS

const Header2 = ({ toggleSidebar }) => {
  return (
    <header className="dashboard-header">
      <div className="menu-icon" onClick={toggleSidebar}>
        <FaBars />
      </div>
      <h1 className="dashboard-title">School Dashboard</h1>
      <div className="user-profile">
        <FaUserCircle className="user-icon" />
        <span className="username">Admin</span>
      </div>
    </header>
  );
};

export default Header2;
