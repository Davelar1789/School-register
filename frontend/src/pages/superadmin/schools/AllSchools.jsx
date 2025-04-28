import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import { toast, Toaster } from "react-hot-toast";
import "./AllSchools.modules.css";
import Header2 from "../../../components/SuperAdmin/Header3";
import Sidebar from "../../../components/SuperAdmin/Sidebar2";

function AllSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/schools", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSchools(response.data);
    } catch (err) {
      console.error("Error fetching schools:", err);
      toast.error("Failed to fetch schools");
    } finally {
      setLoading(false);
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

    <div className="allschools-container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="allschools-header">
        <h1>All Schools</h1>
        <Link to="/add-school" className="add-school-button">
          + Add New School
        </Link>
      </div>

      {loading ? (
        <p className="loading-text">Loading schools...</p>
      ) : (
        <div className="schools-list">
          {schools.length === 0 ? (
            <p>No schools found.</p>
          ) : (
            schools.map((school) => (
              <div key={school._id} className="school-card">
                <h2>{school.name}</h2>
                <p><strong>Headmaster:</strong> {school.headmaster}</p>
                <p><strong>Email:</strong> {school.email}</p>
                <p><strong>Phone:</strong> {school.phone}</p>
                <p><strong>Address:</strong> {school.address}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default AllSchools;
