import React, { useState, useEffect } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import api from "../../../api/axios"; // Import Axios instance
import "./Header2.modules.css"; // Import global CSS

const Header2 = ({ toggleSidebar }) => {
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    const fetchSchoolName = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.schoolId) return;

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await api.get(`/api/schools/${parsedUser.schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSchoolName(response.data.name);
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
