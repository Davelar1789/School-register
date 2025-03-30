import React, { useState, useEffect } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import api from "../../../api/axios"; // Axios instance
import "./Header2.modules.css";

const Header2 = ({ toggleSidebar }) => {
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    const fetchSchoolName = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser._id; // Get logged-in user ID

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        // Fetch all schools from the database
        const response = await api.get("/api/schools", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the school where user ID matches
        const userSchool = response.data.find((school) => school.user === userId);

        if (userSchool) {
          setSchoolName(userSchool.name); // Set school name if found
        }
      } catch (error) {
        console.error("Error fetching school name:", error);
      }
    };

    fetchSchoolName();
  }, []);

  return (
    <header className="dashboard-header">
      <div className="menu-icon" onClick={toggleSidebar}>
        <FaBars />
      </div>
      <h1 className="dashboard-title">{schoolName || "School Dashboard"}</h1>
      <div className="user-profile">
        <FaUserCircle className="user-icon" />
        <span className="username">Admin</span>
      </div>
    </header>
  );
};

export default Header2;
