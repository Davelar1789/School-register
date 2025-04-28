import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaComments,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendar,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import api from "../../api/axios"; // Ensure this points to your axios config
import Image1 from "../../assets/images/userrr.png";

const SidebarTeacher = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
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

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);

      setUser({
        fullName: decoded.fullName,
        role: decoded.role,
      });

      setSchool({
        name: decoded.schoolName,
      });

      // You can later fetch stats using decoded.schoolId if needed
    } catch (error) {
      toast.error("Session expired. Please log in again.");
      navigate("/sign-in");
    }
  }, [navigate]);

  const handleLogout = async () => {
      try {
        localStorage.clear(); // or just remove 'token' if you prefer
        toast.success("Logged out successfully");
        navigate("/sign-in"); // or your login route
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed. Please try again.");
      }
    };
    
    
  

  if (!user) return null;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">{school?.name ? school.name.charAt(0) : "S"}</div>
        <div className="school-name">{school?.name || "School Dashboard"}</div>
      </div>

      {/* Profile */}
      <div className="sidebar-profile">
        <img src={Image1} alt="User" className="profile-pic" />
        <div>
          <h4>{user.fullName}</h4>
          <p className="user-role">{user.role}</p>
        </div>
      </div>

      {/* Nav */}
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/teacher-dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <FaHome className="icon" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>
            <FaComments className="icon" /> Chat
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-classes" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUserGraduate className="icon" />My Classes
          </NavLink>
        </li>
        <li>
          <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
            <FaChalkboardTeacher className="icon" />Gradebook
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCalendar className="icon" /> Events
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

export default SidebarTeacher;
