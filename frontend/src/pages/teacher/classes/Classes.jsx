// Classes.jsx
import React, { useEffect, useState } from "react";
import "./Classes.modules.css";
import axios from "../../../api/axios";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import { useNavigate } from "react-router-dom";


const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/api/teachers/teacher/teacher-classes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(response.data.classes || []);
    } catch (err) {
      // console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);


return (
  <div>
    <Header />
    <Sidebar />
    <div className="class-container">
      <h2 className="class-heading">My Classes</h2>

      {loading ? (
        <div className="loading-inline">Loading classes...</div>
      ) : classes.length === 0 ? (
        <p className="no-classes">No classes assigned to you.</p>
      ) : (
        <div className="class-grid">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="class-card"
              onClick={() => navigate(`/class/${cls._id}`)}
            >
              <h3>{cls.className}</h3>
              <p><strong>Level:</strong> {cls.level}</p>
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
