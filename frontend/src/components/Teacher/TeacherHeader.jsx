import React, { useState, useEffect } from "react";
import {
  FaBell, FaEnvelope, FaCog, FaUser, FaSearch,
  FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { jwtDecode } from "jwt-decode";
import Image1 from "../../assets/images/userrr.png";
import "./Header2.modules.css";
import socket from "./Socket";
import { Tooltip } from 'react-tooltip';


const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [teacherType, setTeacherType] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

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
      const teacherData = JSON.parse(localStorage.getItem("teacher"));
  
      if (!token || !teacherData) {
        toast.error("Please login first.");
        navigate("/sign-in");
        return;
      }
  
      try {
        const decoded = jwtDecode(token);
        // console.log("Decoded token:", decoded);
  
        setUser({
          fullName: decoded.fullName,
          role: decoded.role,
        });
  
        setSchool({
          name: decoded.schoolName,
        });
  
        setTeacherType(teacherData.teacherType || ""); // Set from localStorage
      } catch (error) {
        toast.error("Session expired. Please log in again.");
        navigate("/sign-in");
      }
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
    } catch (error) {
      // console.error("Error fetching school:", error);
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const getTeacherId = () => {
        try {
            const teacherData = JSON.parse(localStorage.getItem("teacher"));
            return teacherData?.id || null;
        } catch (error) {
            console.error("❌ Error retrieving teacher ID:", error);
            return null;
        }
    };

    const teacherId = getTeacherId();

    // ✅ Fetch unread notifications count on page load
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!teacherId) return;

            try {
                const response = await api.get(`/api/notification/unread-count/${teacherId}`);
                setUnreadCount(response.data.count || 0);
            } catch (error) {
                console.error("❌ Error fetching unread count:", error);
            }
        };

        fetchUnreadCount();
    }, [teacherId]);

    // ✅ WebSocket Listener for Real-Time Badge Updates
    useEffect(() => {
        socket.on("new-notification", () => {
            setUnreadCount((prev) => prev + 1); // ✅ Increase unread count in real time
        });

        return () => {
            socket.off("new-notification");
        };
    }, []);

    // ✅ Reset badge count when user visits notifications page
    const handleNotificationClick = async () => {
        navigate("/notifications2");

        try {
            await api.put(`/api/notification/mark-all-read/${teacherId}`);
            setUnreadCount(0); // ✅ Reset unread count after visiting the page
        } catch (error) {
            console.error("❌ Error marking notifications as read:", error);
        }
    };

  const handleLogout = async () => {
    try {
      localStorage.clear(); // or just remove 'token' if you prefer
      toast.success("Logged out successfully");
      navigate("/sign-in"); // or your login route
    } catch (error) {
      // console.error("Logout failed:", error);
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
        <div className="notification-wrapper">
                <FaBell 
                 id="notification-bell"
                  data-tooltip-id="notification-tooltip"
                  data-tooltip-content="You can now click here to view your notifications."
                  data-tooltip-place="bottom"
                className="icon clickable" 
                onClick={handleNotificationClick} 
                style={{ cursor: "pointer" }} />
                {unreadCount > 0 && <span className="notification-badge" onClick={handleNotificationClick}>{unreadCount}</span>}
            </div>
          {windowWidth > 768 && <FaEnvelope className="icon" />}
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
                        <NavLink to="/teacher-dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                          <FaHome className="icon" /> Dashboard
                        </NavLink>
                      </li>
                      {(teacherType === "Class Teacher" || teacherType === "Both") && (
                               <li>
                                 <NavLink to="/my-classes" className={({ isActive }) => isActive ? "active" : ""}>
                                   <FaUserGraduate className="icon" /> My Classes
                                 </NavLink>
                               </li>
                             )}
                     
                             {(teacherType === "Subject Teacher" || teacherType === "Both") && (
                               <li>
                                 <NavLink to="/my-subjects" className={({ isActive }) => isActive ? "active" : ""}>
                                   <FaUserGraduate className="icon" /> My Subjects
                                 </NavLink>
                               </li>
                             )}
                              <li>
                                       <NavLink to="/gradebook" className={({ isActive }) => isActive ? "active" : ""}>
                                         <FaComments className="icon" /> Gradebook
                                       </NavLink>
                                     </li>
                              <li>
                                       <NavLink to="/attendance" className={({ isActive }) => isActive ? "active" : ""}>
                                         <FaComments className="icon" /> Attendance
                                       </NavLink>
                                     </li>
                      {/* <li>
                        <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
                          <FaChalkboardTeacher className="icon" />Gradebook
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
                          <FaCalendar className="icon" /> Events
                        </NavLink>
                      </li> */}
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
