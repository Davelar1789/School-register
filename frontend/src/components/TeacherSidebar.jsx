import React, { useState, useEffect } from "react";
import { FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import api from "../api/axios"; // Ensure this points to your axios config
import Image1 from "../assets/images/userrr.png";

const SidebarTeacher = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  const fetchSchoolViaTeacher = async (teacherId) => {
    try {
      console.log("Fetching teacher data for ID:", teacherId);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await api.get(`/api/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teacherData = response.data.teacher || response.data;

      console.log("Teacher data fetched:", teacherData);

      if (teacherData.school) {
        const schoolData = teacherData.school;
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });

        setUser({
          fullName: teacherData.fullName,
          role: "Teacher",
        });
      } else {
        console.warn("No school data found in teacher response");
      }
    } catch (error) {
      console.error("Error fetching school via teacher:", error);
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
    console.log("Decoded token:", decoded);

    fetchSchoolViaTeacher(decoded.id);
  }, [navigate]);

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
            <FaUserGraduate className="icon" /> Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
            <FaChalkboardTeacher className="icon" /> Teachers
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCalendar className="icon" /> Events
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

export default SidebarTeacher;
