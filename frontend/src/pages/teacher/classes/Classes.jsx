// Classes.jsx
import React, { useEffect, useState } from "react";
import "./Classes.modules.css";
import axios from "../../../api/axios";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header2";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://school-register-a2bx.onrender.com/api/teachers/teacher/teacher-classes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(response.data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (loading) {
    return <div className="loading">Loading classes...</div>;
  }

  return (
    <div>
        <Header />
        <Sidebar />
    <div className="class-container">
      <h2 className="class-heading">My Classes</h2>
      {classes.length === 0 ? (
        <p className="no-classes">No classes assigned to you.</p>
      ) : (
        <div className="class-grid">
          {classes.map((cls) => (
            <div key={cls._id} className="class-card">
              <h3>{cls.className}</h3>
              <p><strong>Level:</strong> {cls.level}</p>
              <p><strong>Description:</strong> {cls.description || "No description provided."}</p>
              <p><strong>Students:</strong> {cls.students?.length || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Classes;
