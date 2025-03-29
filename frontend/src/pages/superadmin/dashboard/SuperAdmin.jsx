import React, { useEffect, useState } from "react";
import Header2 from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./SuperAdmin.modules.css";

const SuperAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingSchools, setPendingSchools] = useState([]);
  const [approvedSchools, setApprovedSchools] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchPendingSchools();
    fetchApprovedSchools();
    fetchUserCount();
  }, []);

  const fetchPendingSchools = async () => {
    try {
      const response = await api.get("/api/superschool/pending");
      setPendingSchools(response.data);
    } catch (error) {
      console.error("Error fetching pending schools:", error);
    }
  };

  const fetchApprovedSchools = async () => {
    try {
      const response = await api.get("/api/superschool/approved");
      setApprovedSchools(response.data);
    } catch (error) {
      console.error("Error fetching approved schools:", error);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await api.get("/api/users/count");
      setTotalUsers(response.data.count);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const handleApprove = async (schoolId) => {
    try {
      await api.put(`/api/schools/approve/${schoolId}`);
      toast.success("School approved successfully!");
      fetchPendingSchools();
      fetchApprovedSchools();
    } catch (error) {
      toast.error("Failed to approve school.");
      console.error("Approval error:", error);
    }
  };

  const handleReject = async (schoolId) => {
    try {
      await api.delete(`/api/schools/reject/${schoolId}`);
      toast.success("School rejected and removed.");
      fetchPendingSchools();
    } catch (error) {
      toast.error("Failed to reject school.");
      console.error("Rejection error:", error);
    }
  };

  return (
    <div className="superadmin-container">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className="superadmin-main">
        {/* Header */}
        <Header2 toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dashboard Content */}
        <div className="superadmin-content">
          {/* Overview Stats */}
          <div className="overview-section">
            <div className="stat-card">Total Users: {totalUsers}</div>
            <div className="stat-card">Approved Schools: {approvedSchools.length}</div>
            <div className="stat-card">Pending Approvals: {pendingSchools.length}</div>
          </div>

          {/* Pending Schools Section */}
          <div className="pending-schools">
            <h3>Pending School Approvals</h3>
            {pendingSchools.length === 0 ? (
              <p className="no-data">No pending schools.</p>
            ) : (
              <ul>
                {pendingSchools.map((school) => (
                  <li key={school._id} className="school-item">
                    <span>{school.name} ({school.email})</span>
                    <div className="actions">
                      <button className="approve-btn" onClick={() => handleApprove(school._id)}>Approve</button>
                      <button className="reject-btn" onClick={() => handleReject(school._id)}>Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Approved Schools Section */}
          <div className="approved-schools">
            <h3>Approved Schools</h3>
            {approvedSchools.length === 0 ? (
              <p className="no-data">No approved schools yet.</p>
            ) : (
              <ul>
                {approvedSchools.map((school) => (
                  <li key={school._id} className="approved-item">
                    {school.name} - {school.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
