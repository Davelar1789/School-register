import React, { useState, useEffect } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import api from "../../../api/axios"; // Axios instance
import "./Header2.modules.css";

const Header2 = ({ toggleSidebar }) => {
  console.log("🔵 Header2 component is mounting...");

  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    console.log("🟡 useEffect triggered: Fetching school name...");

    const fetchSchoolName = async () => {
      try {
        console.log("🔹 Fetch function started...");

        // Get user from localStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.log("❌ No user found in localStorage.");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser._id; // Get logged-in user ID
        console.log("✅ Logged-in User ID:", userId);

        const token = localStorage.getItem("token");
        if (!token) {
          console.log("❌ No token found in localStorage.");
          return;
        }

        console.log("🔄 Fetching all schools from backend...");
        // Fetch all schools from the database
        const response = await api.get("/api/schools", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Schools fetched:", response.data);

        // Find the school where user ID matches
        const userSchool = response.data.find((school) => school.user.toString() === userId);

        if (userSchool) {
          console.log("✅ User's school found:", userSchool.name);
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
