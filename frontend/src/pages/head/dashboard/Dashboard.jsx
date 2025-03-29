import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../api/axios"; // Ensure this is the correct API instance
import Header2 from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import Form from "../../general/register/Sign-up"; // School Registration Form
import "./Dashboard.modules.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
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

    // ✅ Fetch school based on user ID instead of relying on schoolId
    fetchSchool(parsedUser._id);
  }, [navigate]);

  const fetchSchool = async (userId) => {
    try {
      const token = localStorage.getItem("token"); // Get token from local storage
      if (!token) {
        throw new Error("No token found, please log in again.");
      }
  
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Send token in headers
      });
  
      setSchool(response.data.school);
    } catch (error) {
      console.error("Error fetching school:", error);
      toast.error("Error fetching school. Please try again.");
    }
  };
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) return null; // Prevent rendering if user is still loading

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <Header2 toggleSidebar={toggleSidebar} />

        {/* Show Dashboard if school exists, else show Registration Form */}
        <div className="dashboard-content">
          {school ? (
            <>
              {/* Overview Cards */}
              <div className="overview-section">
                <div className="overview-card">Total Students: 1,200</div>
                <div className="overview-card">Total Teachers: 80</div>
                <div className="overview-card">Active Classes: 40</div>
                <div className="overview-card">Pending Requests: 5</div>
              </div>

              {/* Recent Activities */}
              <div className="recent-activities">
                <h3>Recent Activities</h3>
                <ul>
                  <li>New student enrolled: John Doe</li>
                  <li>Teacher application received: Mr. Kwame</li>
                  <li>Upcoming PTA meeting scheduled</li>
                  <li>New event: Science Fair on April 15</li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="quick-links">
                <h3>Quick Links</h3>
                <div className="links-grid">
                  <button className="quick-link">Manage Students</button>
                  <button className="quick-link">Manage Teachers</button>
                  <button className="quick-link">View Reports</button>
                  <button className="quick-link">School Settings</button>
                </div>
              </div>
            </>
          ) : (
            <div className="register-school-section">
              <h2 className="register-title">Register Your School</h2>
              <p className="register-subtitle">
                You need to register a school before accessing the dashboard.
              </p>
              <Form />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
