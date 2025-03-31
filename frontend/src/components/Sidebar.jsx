import React from "react";
import { FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.modules.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* School Logo */}
      <div className="sidebar-header">
        <div className="logo">A</div>
        <div className="school-name">AdminSchool</div>
      </div>

      {/* User Profile */}
      <div className="sidebar-profile">
        <img src="/path-to-profile.jpg" alt="User" className="profile-pic" />
        <div>
          <h4>Zack Foster</h4>
          <p className="user-role">Admin</p>
        </div>
      </div>

      {/* Menu Items */}
      <ul className="sidebar-nav">
        <li><FaHome className="icon" /> Dashboard</li>
        <li><FaComments className="icon" /> Chat</li>
        <li><FaUserGraduate className="icon" /> Student <span className="badge">35</span></li>
        <li><FaChalkboardTeacher className="icon" /> Teacher</li>
        <li><FaCalendar className="icon" /> Event</li>
        <li className="logout"><FaSignOutAlt className="icon" /> Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;
