import React, { useState, useEffect } from "react";
import {
  FaBell, FaEnvelope, FaCog, FaUser, FaSearch,
  FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { jwtDecode } from "jwt-decode";
import Image1 from "../../assets/images/userrr.png";
import "./Header2.modules.css";

const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const isFeesActive = ["/fees", "/school-fees", "/feeding-fee"].includes(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 974) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  }, [navigate]);

  const fetchSchool = async (userId) => {
    try {
      const cached = localStorage.getItem("schoolData");
      if (cached) {
        const schoolData = JSON.parse(cached);
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
        return;
      }

      const token = localStorage.getItem("token");
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        const schoolData = response.data.school || response.data;
        localStorage.setItem("schoolData", JSON.stringify(schoolData));
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

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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
          {windowWidth > 768 && (
            <FaCog
              className="icon"
              onClick={() => navigate('/school-settings')}
            />
          )}
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

      {/* Responsive Sidebar - Slide In */}
      {sidebarOpen && windowWidth <= 974 && user && (
  <div
    className="sidebar-overlay"
    onClick={() => setSidebarOpen(false)}
  >
    <div
      className="mobile-sidebar"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sidebar-header">
        <div className="logo">{school?.name ? school.name.charAt(0) : "S"}</div>
        <div className="school-name">{school?.name || "School Dashboard"}</div>
      </div>

      <div className="sidebar-profile">
        <img src={Image1} alt="User" className="profile-pic" />
        <div>
          <h4>{user.fullName}</h4>
          <p className="user-role">{user.role}</p>
        </div>
      </div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
            <FaHome className="icon" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/termly-details" onClick={() => setSidebarOpen(false)}>
            <FaComments className="icon" /> Termly Details
          </NavLink>
        </li>
        <li>
          <NavLink to="/fees" className={isFeesActive ? "active" : ""}>
            <FaUserGraduate className="icon" /> Fees
          </NavLink>
        </li>
        <li>
          <NavLink to="/expenses" onClick={() => setSidebarOpen(false)}>
            <FaCalendar className="icon" /> Expenses
          </NavLink>
        </li>
        <li>
          <NavLink to="/income" onClick={() => setSidebarOpen(false)}>
            <FaChalkboardTeacher className="icon" /> Income Statement
          </NavLink>
        </li>
        <li>
          <NavLink to="/students-teachers" onClick={() => setSidebarOpen(false)}>
            <FaUserGraduate className="icon" /> Student/Teachers
            <span className="badge">{schoolStats.numberOfStudents}</span>
          </NavLink>
        </li>
        {/* <li>
          <NavLink to="/teachers" onClick={() => setSidebarOpen(false)}>
            <FaChalkboardTeacher className="icon" /> Teacher
          </NavLink>
        </li> */}
        <li>
          <NavLink to="/classes-main" onClick={() => setSidebarOpen(false)}>
            <FaChalkboardTeacher className="icon" /> Classes
          </NavLink>
        </li>
        <li onClick={handleLogout} style={{ cursor: "pointer" }}>
  <div className="nav-link-custom">
    <FaSignOutAlt className="icon" /> Logout
  </div>
</li>

      </ul>
    </div>
  </div>
)}

    </>
  );
};

export default Header;
