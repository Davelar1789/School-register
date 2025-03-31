import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../api/axios"; // Ensure this is the correct API instance
import Header2 from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import Form from "../../general/register/Sign-up"; // School Registration Form
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import "./Dashboard.modules.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
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

  const fetchSchool = async (userId) => {
    try {
      const token = localStorage.getItem("token"); // Get token from local storage
      if (!token) {
        throw new Error("No token found, please log in again.");
      }

      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Send token in headers
      });

      if (response.data.school) {
        setSchool(response.data.school);
        setSchoolStats({
          numberOfStudents: response.data.school.numberOfStudents || 0,
          numberOfTeachers: response.data.school.numberOfTeachers || 0,
          numberOfClasses: response.data.school.numberOfClasses || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
    }
  };

  if (!user) return null; // Prevent rendering if user is still loading

  return (
    <div className="dashboard-container">
      {/* Sidebar - Integrated Directly */}
      <Sidebar />

      {/* Main Content - Starts After Sidebar */}
      <div className="dashboard-main">
        <Header2 />

        {/* Show Dashboard if school exists, else show Registration Form */}
        <div className="dashboard-content">
          {school ? (
            <>
             <div className="overview-section">
                <div className="overview-card students">
                  <div className="card-header">
                    <i className="fas fa-user-graduate"></i>
                    <div className="card-info">
                      <h3>{schoolStats.numberOfStudents}</h3>
                      <p>Total Students</p>
                    </div>
                  </div>
                  <div className="wave-chart blue-wave"></div>
                </div>

                <div className="overview-card teachers">
                  <div className="card-header">
                    <i className="fas fa-user"></i>
                    <div className="card-info">
                      <h3>{schoolStats.numberOfTeachers}</h3>
                      <p>Total Teachers</p>
                    </div>
                  </div>
                  <div className="wave-chart pink-wave"></div>
                </div>

                <div className="overview-card classes">
                  <div className="card-header">
                    <i className="fas fa-users"></i>
                    <div className="card-info">
                      <h3>{schoolStats.numberOfClasses}</h3>
                      <p>Active Classes</p>
                    </div>
                  </div>
                  <div className="wave-chart orange-wave"></div>
                </div>

                <div className="overview-card requests">
                  <div className="card-header">
                    <i className="fas fa-money-check-alt"></i>
                    <div className="card-info">
                      <h3>0</h3>
                      <p>Pending Requests</p>
                    </div>
                  </div>
                  <div className="wave-chart green-wave"></div>
                </div>
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
