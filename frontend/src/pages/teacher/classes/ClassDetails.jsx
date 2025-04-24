import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";
import Header from "../../../components/Header2";
import Sidebar from "../../../components/TeacherSidebar";
import "./ClassDetails.modules.css";

const ClassDetails = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClassDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/classes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassData(response.data);
    } catch (err) {
      console.error("Error fetching class details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading class...</div>;
  }

  if (!classData) {
    return <div className="error">Class not found.</div>;
  }

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="class-details-container">
        <h2 className="class-title">{classData.className} - {classData.level}</h2>
        <div className="student-grid">
          {classData.students.map((student) => (
            <div key={student._id} className="student-card">
              <div className="student-avatar">{student.name[0]}</div>
              <div className="student-details">
                <h4>{student.name}</h4>
                <p>ID: {student.idno}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
