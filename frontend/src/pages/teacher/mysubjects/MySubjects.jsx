import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./MySubjects.modules.css";

const MySubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const teacher = JSON.parse(localStorage.getItem("teacher"));
    const teacherId = teacher?.id;
  
    useEffect(() => {
      if (!teacherId) return;
  
      const fetchSubjects = async () => {
        try {
          const { data } = await axios.get(`/api/teachers/${teacherId}/subjects`);
          setSubjects(data.subjects || []);
        } catch (error) {
          console.error("Failed to fetch subjects:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchSubjects();
    }, [teacherId]); // Depend on teacherId
  
  

  return (
    <div className="my-subjects-page2">
      <Sidebar />
        <Header />
        <div className="my-subjects-page">
        <div className="main-content">
        <div className="subjects-container">
          <h2>My Subjects</h2>
          {loading ? (
            <p>Loading...</p>
          ) : subjects.length === 0 ? (
            <p>No subjects assigned yet.</p>
          ) : (
            <div className="subject-cards">
              {subjects.map((item, index) => (
                <div className="subject-card" key={index}>
                  <h3>{item.subjectName}</h3>
                  <p><strong>Class:</strong> {item.className}</p>
                  <p><strong>Level:</strong> {item.level}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
</div>
    </div>
  );
};

export default MySubjects;
