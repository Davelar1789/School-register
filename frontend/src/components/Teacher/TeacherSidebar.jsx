import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaComments,
  FaUserGraduate,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import Image1 from "../../assets/images/userrr.png";

const SidebarTeacher = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [teacherType, setTeacherType] = useState("");
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  const navigate = useNavigate();

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const teacherData = JSON.parse(localStorage.getItem("teacher"));

    if (!token || !teacherData) {
      toast.error("Please login first.");
      navigate("/teacher-login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      setUser({
        fullName: decoded.fullName,
        role: decoded.role,
      });

      setSchool({
        name: decoded.schoolName,
      });

      setTeacherType(teacherData.teacherType || "");
    } catch (error) {
      toast.error("Session expired. Please log in again.");
      navigate("/teacher-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.clear();
      toast.success("Logged out successfully");
      navigate("/teacher-login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!user) return null;

  // Helper to conditionally disable links in offline mode
  const isDisabled = (path) => {
    if (!offlineMode) return false;
    // Only allow dashboard and attendance in offline mode
    return !["/teacher-dashboard", "/attendance"].includes(path);
  };

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

      {/* Navigation */}
      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/teacher-dashboard"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <FaHome className="icon" /> Dashboard
          </NavLink>
        </li>

        {(teacherType === "Class Teacher" || teacherType === "Both") && (
          <li>
            <NavLink
              to="/my-classes"
              className={({ isActive }) => isActive ? "active" : ""}
              style={isDisabled("/my-classes") ? { pointerEvents: "none", opacity: 0.5 } : {}}
            >
              <FaUserGraduate className="icon" /> My Classes
            </NavLink>
          </li>
        )}

        {(teacherType === "Subject Teacher" || teacherType === "Both") && (
          <li>
            <NavLink
              to="/my-subjects"
              className={({ isActive }) => isActive ? "active" : ""}
              style={isDisabled("/my-subjects") ? { pointerEvents: "none", opacity: 0.5 } : {}}
            >
              <FaUserGraduate className="icon" /> My Subjects
            </NavLink>
          </li>
        )}

        <li>
          <NavLink
            to="/gradebook"
            className={({ isActive }) => isActive ? "active" : ""}
            style={isDisabled("/gradebook") ? { pointerEvents: "none", opacity: 0.5 } : {}}
          >
            <FaComments className="icon" /> Gradebook
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/attendance"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <FaComments className="icon" /> Attendance
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
