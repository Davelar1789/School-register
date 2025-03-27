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
          <h2 className="dashboard-welcome">Welcome, Admin</h2>

          {/* Stats Overview */}
          <div className="stats-container">
            <div className="stat-box students">
              <h3>Total Students</h3>
              <p>1,240</p>
            </div>
            <div className="stat-box schools">
              <h3>Total Schools</h3>
              <p>35</p>
            </div>
            <div className="stat-box teachers">
              <h3>Total Teachers</h3>
              <p>215</p>
            </div>
            <div className="stat-box admins">
              <h3>Administrators</h3>
              <p>12</p>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="recent-activities">
            <h3>Recent Activities</h3>
            <ul>
              <li>✅ New school registered: Bright Future Academy</li>
              <li>✅ Headmaster of Royal Academy updated profile</li>
              <li>✅ 10 new students added to Greenfield School</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn add-school">➕ Add School</button>
              <button className="action-btn manage-students">📚 Manage Students</button>
              <button className="action-btn view-reports">📊 View Reports</button>
              <button className="action-btn settings">⚙️ Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
