import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../api/axios";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Curriculum.modules.css";

const Curriculum = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [step, setStep] = useState("classes"); // "classes" | "subjects" | "curriculum"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teacher = JSON.parse(localStorage.getItem("teacher"));
  const teacherId = teacher?.id;
  const teacherType = teacher?.teacherType; // "Class Teacher" | "Subject Teacher" | "Both"

  // Step 1: Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(data.classes || []);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Step 2: Fetch subjects when a class is selected
  const handleClassClick = async (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setCurriculum(null);
    setStep("subjects");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `/api/teachers/${teacherId}/subjects2`,
        {
          params: { classId: cls._id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter subjects to only those belonging to the selected class
      const filtered = (data.subjects || []).filter(
        (s) => s.classId === cls._id || s.className === cls.className
      );
      setSubjects(filtered.length > 0 ? filtered : data.subjects || []);
    } catch (err) {
      setError("Failed to load subjects for this class.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Fetch curriculum when a subject is selected
  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setStep("curriculum");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `/api/curriculum/${subject.subjectId}/${selectedClass._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurriculum(data.curriculum || null);
    } catch (err) {
      setError("No curriculum found for this subject.");
      setCurriculum(null);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "curriculum") {
      setStep("subjects");
      setSelectedSubject(null);
      setCurriculum(null);
    } else if (step === "subjects") {
      setStep("classes");
      setSelectedClass(null);
      setSubjects([]);
    }
    setError("");
  };

  return (
    <div className="curriculum-wrapper">
      <Header />
      <Sidebar />

      <div className="curriculum-container">
        {/* Breadcrumb */}
        <div className="curriculum-breadcrumb">
          <span
            className={step === "classes" ? "crumb active" : "crumb clickable"}
            onClick={() => step !== "classes" && setStep("classes")}
          >
            Classes
          </span>
          {selectedClass && (
            <>
              <span className="crumb-sep">›</span>
              <span
                className={step === "subjects" ? "crumb active" : "crumb clickable"}
                onClick={() => step === "curriculum" && setStep("subjects")}
              >
                {selectedClass.className}
              </span>
            </>
          )}
          {selectedSubject && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb active">{selectedSubject.subjectName}</span>
            </>
          )}
        </div>

        {/* Back button */}
        {step !== "classes" && (
          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
        )}

        {/* Page Title */}
        <h2 className="curriculum-heading">
          {step === "classes" && "Select a Class"}
          {step === "subjects" && `Subjects — ${selectedClass?.className}`}
          {step === "curriculum" && `Curriculum — ${selectedSubject?.subjectName}`}
        </h2>

        {/* Teacher type badge */}
        <div className="teacher-type-badge">
          <span>{teacherType}</span>
        </div>

        {/* Error */}
        {error && <div className="curriculum-error">{error}</div>}

        {/* Loading */}
        {loading && <div className="curriculum-loading">Loading...</div>}

        {/* STEP 1: Classes */}
        {!loading && step === "classes" && (
          <div className="curriculum-grid">
            {classes.length === 0 ? (
              <p className="curriculum-empty">No classes assigned to you.</p>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls._id}
                  className="curriculum-card class-card"
                  onClick={() => handleClassClick(cls)}
                >
                  <div className="card-icon">🏫</div>
                  <h3>{cls.className}</h3>
                  <p className="card-meta">{cls.level}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 2: Subjects */}
        {!loading && step === "subjects" && (
          <div className="curriculum-grid">
            {subjects.length === 0 ? (
              <p className="curriculum-empty">No subjects found for this class.</p>
            ) : (
              subjects.map((sub, idx) => (
                <div
                  key={sub.subjectId || idx}
                  className="curriculum-card subject-card"
                  onClick={() => handleSubjectClick(sub)}
                >
                  <div className="card-icon">📚</div>
                  <h3>{sub.subjectName}</h3>
                  <p className="card-meta">Click to view curriculum</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 3: Curriculum */}
        {!loading && step === "curriculum" && (
          <div className="curriculum-content">
            {!curriculum ? (
              <div className="curriculum-empty-box">
                <span className="empty-icon">📄</span>
                <p>No curriculum has been set for <strong>{selectedSubject?.subjectName}</strong> in <strong>{selectedClass?.className}</strong> yet.</p>
              </div>
            ) : (
              <div className="curriculum-detail">
                <div className="curriculum-meta-bar">
                  <span>📘 {selectedSubject?.subjectName}</span>
                  <span>🏫 {selectedClass?.className}</span>
                  <span>📅 {curriculum.term || "All Terms"}</span>
                </div>

                {curriculum.topics?.length > 0 && (
                  <div className="curriculum-section">
                    <h3>Topics</h3>
                    <ul className="topic-list">
                      {curriculum.topics.map((topic, i) => (
                        <li key={i} className="topic-item">
                          <span className="topic-num">{i + 1}</span>
                          <div>
                            <strong>{topic.title || topic}</strong>
                            {topic.description && <p>{topic.description}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {curriculum.objectives?.length > 0 && (
                  <div className="curriculum-section">
                    <h3>Learning Objectives</h3>
                    <ul className="objectives-list">
                      {curriculum.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {curriculum.notes && (
                  <div className="curriculum-section">
                    <h3>Notes</h3>
                    <p>{curriculum.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Curriculum;
