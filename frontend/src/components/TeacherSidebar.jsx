import React, { useState, useEffect } from "react";
import { FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import Image1 from "../assets/images/userrr.png";
import { jwtDecode } from "jwt-decode";

const TeacherSidebar = () => {
  const [teacher, setTeacher] = useState(null);
  const [school, setSchool] = useState(null);
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
      const teacherId = decoded.id;
      const role = decoded.role;

      if (role !== "teacher" && role !== "Teacher") {
        toast.error("Unauthorized");
        navigate("/sign-in");
        return;
      }

      // Fetch teacher and school info
      fetchTeacherInfo(teacherId);
    } catch (err) {
      console.error("Token decode failed", err);
      toast.error("Session expired, please login again.");
      navigate("/sign-in");
    }
  }, [navigate]);

  const fetchTeacherInfo = async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const teacherData = response.data.teacher || response.data;
        setTeacher(teacherData);

        // If school is nested in the teacher object
        if (teacherData.school) {
          setSchool(teacherData.school);
        } else {
          // If not, fetch it separately
          const schoolRes = await api.get(`/api/schools/${teacherData.schoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (schoolRes.data) {
            setSchool(schoolRes.data.school || schoolRes.data);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching teacher/school info", err);
    }
  };

  if (!teacher) return null;

  return (
    <div className="sidebar">
      {/* Header with School */}
      <div className="sidebar-header">
        <div className="logo">{school?.name?.charAt(0) || "S"}</div>
        <div className="school-name">{school?.name || "School Dashboard"}</div>
      </div>

      {/* Profile */}
      <div className="sidebar-profile">
        <img src={Image1} alt="Teacher" className="profile-pic" />
        <div>
          <h4>{teacher.fullName}</h4>
          <p className="user-role">Teacher</p>
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
          <NavLink to="/my-students" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUserGraduate className="icon" /> My Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-classes" className={({ isActive }) => isActive ? "active" : ""}>
            <FaChalkboardTeacher className="icon" /> My Classes
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCalendar className="icon" /> Event
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

export default TeacherSidebar;
