import React, { useState, useEffect } from "react";
import { FaHome, FaUser, FaCommentDots, FaUsers, FaCalendarAlt, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import "../pages/head/students/Students.modules.css";
import { toast } from "react-hot-toast";
import api from "../api/axios"; // API instance
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image1 from "../assets/images/userrr.png";
import jwt_decode from "jwt-decode";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first.");
      navigate("/sign-in");
      return;
    }

    const decoded = jwt_decode(token);
    setUser({
      id: decoded.id,
      fullName: decoded.fullName,
      role: decoded.role,
      schoolName: decoded.schoolName,
    });

    fetchSchool(decoded.id);
  }, [navigate]);


  if (!user) return null;

  return (
    <div className="sidebar">
            {/* School Logo */}
            <div className="sidebar-header">
              <div className="logo">{school?.name ? school.name.charAt(0) : "S"}</div>
              <div className="school-name">{school?.name || "School Dashboard"}</div>
            </div>
    
            {/* User Profile */}
            <div className="sidebar-profile">
              <img src={Image1} alt="User" className="profile-pic" />
              <div>
              <h4>{userProfile.fullName}</h4>
              <p className="user-role">{userProfile.role}</p>
            </div>
            </div>
    
            {/* Menu Items */}
            <ul className="sidebar-nav">
      <li>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          <FaHome className="icon" /> Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>
          <FaComments className="icon" /> Chat
        </NavLink>
      </li>
      <li>
        <NavLink to="/students" className={({ isActive }) => isActive ? "active" : ""}>
          <FaUserGraduate className="icon" /> Student <span className="badge">35</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
          <FaChalkboardTeacher className="icon" /> Teacher
        </NavLink>
      </li>
      <li>
        <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
          <FaCalendar className="icon" /> Event
        </NavLink>
      </li>
      <li className="logout">
        <NavLink to="/logout">
          <FaSignOutAlt className="icon" /> Logout
        </NavLink>
      </li>
    </ul>
          </div>
  );
};

export default Sidebar;
