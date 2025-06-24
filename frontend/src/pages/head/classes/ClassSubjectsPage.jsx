import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import "./ClassSubjects.modules.css";
import { Link } from "react-router-dom";


const ClassSubjectsPage = () => {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchSubjectsForClass = async () => {
      try {
        const [subjectsRes, classRes] = await Promise.all([
          axios.get(`/api/subjects/class/${classId}`),
          axios.get(`/api/classes/${classId}`)
        ]);

        setSubjects(subjectsRes.data);
        setClassName(classRes.data?.className || "Class");
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };

    fetchSubjectsForClass();
  }, [classId]);

  return (
    <div className="class-subjects-page">
      <Header />
      <div className="class-subjects-content">
        <Sidebar />
        <div className="class-subjects-main">
          <h2>Subjects for {className}</h2>

          {subjects.length === 0 ? (
            <p>No subjects found for this class.</p>
          ) : (
            <ul className="subject-list">
              {subjects.map(subject => (
                <li key={subject._id} className="subject-item">
                  <div>
                    <h4>{subject.name}</h4>
                    <p>Subject ID: {subject._id}</p>
                  </div>
                    <Link to={`/classes/${classId}/subjects/${subject._id}/topics?classId=${classId}`}>
                    <button className="edit-btn">Edit Topics</button>
                    </Link>
                  {/* Later: Link this to topic editing per term */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassSubjectsPage;
