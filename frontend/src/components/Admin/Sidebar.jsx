import React, { useState, useEffect } from "react";
import { 
  FaHome, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCalendar, 
  FaMoneyBillWave,
  FaChartLine,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt 
} from "react-icons/fa";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import "../../pages/head/students/Students.modules.css";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image1 from "../../assets/images/userrr.png";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();
  
  const isFeesActive = ["/fees", "/school-fees", "/feeding-fee"].includes(location.pathname);

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
      localStorage.removeItem("token");   
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

      {/* Menu Items with Groups */}
      <nav className="sidebar-nav">
        {/* Overview Section */}
        <div className="nav-section">
          <div className="section-title">OVERVIEW</div>
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                <FaHome className="icon" /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/termly-details" className={({ isActive }) => isActive ? "active" : ""}>
                <FaCalendar className="icon" /> Termly Details
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Academic Management */}
        <div className="nav-section">
          <div className="section-title">ACADEMIC</div>
          <ul>
            <li>
              <NavLink to="/students-teachers" className={({ isActive }) => isActive ? "active" : ""}>
                <FaUsers className="icon" /> Students & Teachers
              </NavLink>
            </li>
            <li>
              <NavLink to="/classes-main" className={({ isActive }) => isActive ? "active" : ""}>
                <FaChalkboardTeacher className="icon" /> Classes
              </NavLink>
            </li>
            <li>
              <NavLink to="/view-attendance" className={({ isActive }) => isActive ? "active" : ""}>
                <FaClipboardList className="icon" /> Attendance
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Financial Management */}
        <div className="nav-section">
          <div className="section-title">FINANCIAL</div>
          <ul>
            <li>
              <NavLink to="/fees" className={isFeesActive ? "active" : ""}>
                <FaMoneyBillWave className="icon" /> Fees Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/expenses">
                <FaChartLine className="icon" /> Expenses
              </NavLink>
            </li>
            <li>
              <NavLink to="/income">
                <FaChartLine className="icon" /> Income Statement
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <div className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="icon" /> Logout
        </div>
      </div>
    </div>
  );
};

export default Sidebar;