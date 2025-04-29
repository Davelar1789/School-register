import React, { useState, useEffect } from "react";
import {
  FaHome, FaUser, FaCommentDots, FaUsers, FaCalendarAlt,
  FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import "../../pages/head/students/Students.modules.css";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image1 from "../../assets/images/userrr.png";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first.");
      navigate("/sign-in");
      return;
    }

    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      fullName: decoded.fullName,
      role: decoded.role,
      schoolName: decoded.schoolName,
    });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/api/users/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.clear();
      toast.success("Logged out successfully");
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!user) return null;

  return (
    <div className="sidebar">
    
            {/* User Profile */}
            <div className="sidebar-profile">
              <img src={Image1} alt="User" className="profile-pic" />
              <div>
              <h4>{user.fullName}</h4>
              <p className="user-role">{user.role}</p>
            </div>
            </div>
    
            {/* Menu Items */}
            <ul className="sidebar-nav">
      <li>
        <NavLink to="/superadmin" className={({ isActive }) => isActive ? "active" : ""}>
          <FaHome className="icon" /> Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>
          <FaComments className="icon" /> Chat
        </NavLink>
      </li>
      <li>
        <NavLink to="/all-schools" className={({ isActive }) => isActive ? "active" : ""}>
          <FaChalkboardTeacher className="icon" /> Schools
        </NavLink>
      </li>
      <li>
        <NavLink to="/add-admin" className={({ isActive }) => isActive ? "active" : ""}>
          <FaChalkboardTeacher className="icon" /> Add Admin
        </NavLink>
      </li>
      <li onClick={handleLogout} style={{ cursor: "pointer" }}>
        <div className="nav-link-custom">
          <FaSignOutAlt className="icon" /> Logout
        </div>
      </li>

    </ul>
          </div>
  );
};

export default Sidebar;
