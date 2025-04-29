import React, { useState, useEffect } from "react";
import {
  FaBell, FaEnvelope, FaCog, FaUser, FaSearch,
  FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import api from "../../api/axios";
import Image1 from "../../assets/images/userrr.png";
import "./Header2.modules.css";

const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

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
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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

      <div className="sidebar-profile">
        <img src={Image1} alt="User" className="profile-pic" />
        <div>
          <h4>{user.fullName}</h4>
          <p className="user-role">{user.role}</p>
        </div>
      </div>

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
               <NavLink to="/classes" className={({ isActive }) => isActive ? "active" : ""}>
                 <FaChalkboardTeacher className="icon" /> Settings
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
