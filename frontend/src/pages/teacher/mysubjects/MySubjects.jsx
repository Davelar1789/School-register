import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./MySubjects.modules.css";

const MySubjects = () => {
  const [subjectsGrouped, setSubjectsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [openSubjects, setOpenSubjects] = useState([]);

  const teacher = JSON.parse(localStorage.getItem("teacher"));
  const teacherId = teacher?.id;

  useEffect(() => {
    if (!teacherId) return;

    const fetchSubjects = async () => {
      try {
        const { data } = await axios.get(`/api/teachers/${teacherId}/subjects`);
        const grouped = data.subjects.reduce((acc, item) => {
          const key = item.subjectName;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
        setSubjectsGrouped(grouped);
      } catch (error) {
        // console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [teacherId]);

  const toggleDropdown = (subject) => {
    setOpenSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="my-subjects-page2">
      <Sidebar />
      <Header />
      <div className="my-subjects-page">
        <div className="main-content">
          <div className="subjects-container">
            <h2 className="whiten">My Subjects</h2>
            {loading ? (
              <p>Loading...</p>
            ) : Object.keys(subjectsGrouped).length === 0 ? (
              <p className="yet">No subjects assigned yet.</p>
            ) : (
              <div className="subject-groups">
                {Object.entries(subjectsGrouped).map(([subject, classes], index) => (
                  <div className="subject-group" key={index}>
                    <div
                      className="subject-header"
                      onClick={() => toggleDropdown(subject)}
                    >
                      <h3>{subject}</h3>
                      <span className={`dropdown-icon ${openSubjects.includes(subject) ? "open" : ""}`}>
                        ▼
                      </span>
                    </div>
                    {openSubjects.includes(subject) && (
                      <ul className="class-list">
                        {classes.map((item, idx) => (
                          <li key={idx}>
                            {item.subjectName} - {item.className}
                          </li>
                        ))}
                      </ul>
                    )}
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
