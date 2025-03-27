import React, { useState } from "react";
import Header2 from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import "./Dashboard.modules.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <Header2 toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className="dashboard-content">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
