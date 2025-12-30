import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../api/axios";
import Header2 from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUsers, 
  FaMoneyCheckAlt,
  FaSpinner,
  FaArrowRight
} from "react-icons/fa";
import "./Dashboard.modules.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Please login first.");
        navigate("/sign-in");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      await fetchSchool(parsedUser._id);
      setLoading(false);
    };

    initializeDashboard();
  }, [navigate]);

  const fetchSchool = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        const schoolData = response.data.school || response.data;
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
      toast.error("Failed to load school data");
    }
  };

  const statsCards = [
    {
      id: 1,
      title: "Total Students",
      value: schoolStats.numberOfStudents,
      icon: FaUserGraduate,
      colorClass: "stat-card-blue"
    },
    {
      id: 2,
      title: "Total Teachers",
      value: schoolStats.numberOfTeachers,
      icon: FaChalkboardTeacher,
      colorClass: "stat-card-pink"
    },
    {
      id: 3,
      title: "Active Classes",
      value: schoolStats.numberOfClasses,
      icon: FaUsers,
      colorClass: "stat-card-orange"
    },
    {
      id: 4,
      title: "Pending Requests",
      value: 0,
      icon: FaMoneyCheckAlt,
      colorClass: "stat-card-green"
    }
  ];

  const quickLinks = [
    { label: "Manage Students", path: "/students" },
    { label: "Manage Teachers", path: "/teachers" },
    { label: "View Reports", path: "/view-reports" },
    { label: "School Settings", path: "/settings" }
  ];

  if (!user || loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="loading-spinner" />
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header2 />
        
        <main className="dashboard-content">
          <div className="dashboard-wrapper">
            
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back! 👋</h1>
              <p className="welcome-subtitle">
                Here's what's happening with your school today
              </p>
            </div>

            <div className="stats-grid">
              {statsCards.map((card) => (
                <div key={card.id} className={`stat-card ${card.colorClass}`}>
                  <div className="stat-card-bg"></div>
                  
                  <div className="stat-card-content">
                    <div className="stat-icon-wrapper">
                      <card.icon className="stat-icon" />
                    </div>

                    <div className="stat-value">
                      {card.value.toLocaleString()}
                    </div>

                    <p className="stat-label">{card.title}</p>

                    <div className="stat-trend">
                      <span className="stat-trend-value">+12%</span>
                      <span className="stat-trend-label">vs last month</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-links-section">
              <div className="section-header">
                <h2 className="section-title">Quick Actions</h2>
                <div className="section-divider"></div>
              </div>

              <div className="quick-links-grid">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="quick-link-button"
                  >
                    <span className="quick-link-shine"></span>
                    <span className="quick-link-text">{link.label}</span>
                    <FaArrowRight className="quick-link-arrow" />
                  </button>
                ))}
              </div>
            </div>

            <div className="recent-activity-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">New student registered</p>
                    <p className="activity-time">2 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">Teacher submitted report</p>
                    <p className="activity-time">5 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">Class schedule updated</p>
                    <p className="activity-time">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;