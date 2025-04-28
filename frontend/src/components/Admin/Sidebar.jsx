import React, { useState, useEffect } from "react";
import { FaHome, FaUser, FaCommentDots, FaUsers, FaCalendarAlt, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import "../pages/head/students/Students.modules.css";
import { toast } from "react-hot-toast";
import api from "../../api/axios"; // API instance
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image1 from "../assets/images/userrr.png";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [school, setSchool] = useState(null)
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  const fetchSchool = async (userId) => {
    try {
      const cachedSchoolData = localStorage.getItem('schoolData');
      if (cachedSchoolData) {
        const schoolData = JSON.parse(cachedSchoolData);
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        const schoolData = response.data.school || response.data;
        localStorage.setItem('schoolData', JSON.stringify(schoolData));
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
    }
  };
  
  
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
  
    fetchSchool(decoded.id);
  
    // ✅ Listen for school data updates
    const handleSchoolUpdate = () => {
      const cachedSchoolData = localStorage.getItem("schoolData");
      if (cachedSchoolData) {
        const schoolData = JSON.parse(cachedSchoolData);
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    };
  
    window.addEventListener("schoolDataUpdated", handleSchoolUpdate);
  
    return () => {
      window.removeEventListener("schoolDataUpdated", handleSchoolUpdate);
    };
  }, [navigate]);
  

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/api/users/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
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
            {/* School Logo */}
            <div className="sidebar-header">
              <div className="logo">{school?.name ? school.name.charAt(0) : "S"}</div>
              <div className="school-name">{school?.name || "School Dashboard"}</div>
            </div>
    
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
        <NavLink to="/fees" className={({ isActive }) => isActive ? "active" : ""}>
          <FaUserGraduate className="icon" /> Fees 
        </NavLink>
      </li>
      <li>
        <NavLink to="/students" className={({ isActive }) => isActive ? "active" : ""}>
          <FaUserGraduate className="icon" /> Student <span className="badge">{schoolStats.numberOfStudents}
          </span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
          <FaChalkboardTeacher className="icon" /> Teacher
        </NavLink>
      </li>
      <li>
        <NavLink to="/classes" className={({ isActive }) => isActive ? "active" : ""}>
          <FaChalkboardTeacher className="icon" /> Classes
        </NavLink>
      </li>
      <li>
        <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
          <FaCalendar className="icon" /> Event
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
