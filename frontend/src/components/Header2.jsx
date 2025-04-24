import React, { useState, useEffect } from "react";
import {
  FaBell, FaEnvelope, FaCog, FaUser, FaSearch,
  FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import Image1 from "../assets/images/userrr.png";
import "./Header2.modules.css";

const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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

      {/* Responsive Sidebar - Slide In */}
      {sidebarOpen && windowWidth <= 974 && user && (
        <div className="mobile-sidebar">
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
              <NavLink to="/chat" onClick={() => setSidebarOpen(false)}>
                <FaComments className="icon" /> Chat
              </NavLink>
            </li>
            <li>
              <NavLink to="/students" onClick={() => setSidebarOpen(false)}>
                <FaUserGraduate className="icon" /> Student
                <span className="badge">{schoolStats.numberOfStudents}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/teachers" onClick={() => setSidebarOpen(false)}>
                <FaChalkboardTeacher className="icon" /> Teacher
              </NavLink>
            </li>
            <li>
              <NavLink to="/classes" onClick={() => setSidebarOpen(false)}>
                <FaChalkboardTeacher className="icon" /> Classes
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" onClick={() => setSidebarOpen(false)}>
                <FaCalendar className="icon" /> Event
              </NavLink>
            </li>
            <li className="logout">
              <NavLink to="/logout" onClick={() => setSidebarOpen(false)}>
                <FaSignOutAlt className="icon" /> Logout
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Header;
