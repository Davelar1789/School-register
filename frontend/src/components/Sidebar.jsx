import React, { useState, useEffect } from "react";
import { FaHome, FaUser, FaCommentDots, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../pages/head/students/Students.modules.css";
import { toast } from "react-hot-toast";
import api from "../api/axios"; // Ensure this is the correct API instance
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import Image1 from "../assets/images/userrr.png"


const Sidebar = ({ school, userProfile }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolName, setSchoolName] = useState("Loading...");
  const [userProfile, setUserProfile] = useState({ fullName: "Loading...", role: "Loading..." });
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Get user from local storage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login first.");
      navigate("/sign-in");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // ✅ Fetch school based on user ID
    fetchSchool(parsedUser._id);
  }, [navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }
  
        const response = await api.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data) {
          setUserProfile({
            fullName: response.data.fullName || "Unknown",
            role: response.data.role || "User",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
  
    fetchUserProfile();
  }, []);

  useEffect(() => {

    const fetchSchoolName = async () => {
      try {

        // Get user from localStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser._id; // Get logged-in user ID

        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        // Fetch all schools from the database
        const response = await api.get("/api/schools", {
          headers: { Authorization: `Bearer ${token}` },
        });


        // Find the school where user ID matches
        const userSchool = response.data.find((school) => school.user.toString() === userId);

        if (userSchool) {
          setSchoolName(userSchool.name); // Set school name if found
        } else {
          console.log("❌ No school found for this user.");
        }
      } catch (error) {
        console.error("🚨 Error fetching school name:", error);
      }
    };

    fetchSchoolName();
  }, []);

  const fetchSchool = async (userId) => {
    try {
      const token = localStorage.getItem("token"); // Get token from local storage
      if (!token) {
        throw new Error("No token found, please log in again.");
      }
  
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Send token in headers
      });
  
      if (response.data) {
        const schoolData = response.data.school || response.data; // Handle both API response structures
  
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
        console.log("Fetched School Data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching school:", error);
    }
  };
  
  if (!user) return null; // Prevent rendering if user is still loading

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
              <h4>{userProfile.fullName}</h4>
              <p className="user-role">{userProfile.role}</p>
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
        <NavLink to="/students" className={({ isActive }) => isActive ? "active" : ""}>
          <FaUserGraduate className="icon" /> Student <span className="badge">35</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
          <FaChalkboardTeacher className="icon" /> Teacher
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

export default Sidebar;
