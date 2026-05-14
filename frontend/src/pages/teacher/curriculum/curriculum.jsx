import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../api/axios";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import curriculumData from "./curriculumData"; // adjust path if needed
import "./Curriculum.modules.css";

const TERMS = [1, 2, 3];

const Curriculum = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTerm, setActiveTerm] = useState(1);
  const [step, setStep] = useState("classes"); // "classes" | "subjects" | "curriculum"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teacher = JSON.parse(localStorage.getItem("teacher"));
  const teacherId = teacher?.id;
  const teacherType = teacher?.teacherType;

  // ── Step 1: Fetch classes ────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(data.classes || []);
    } catch {
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // ── Step 2: Fetch subjects for selected class ────────────────────────────
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

  // ── Step 3: Show curriculum (from hardcoded data) ───────────────────────
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setActiveTerm(1);
    setStep("curriculum");
    setError("");
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const goBack = () => {
    if (step === "curriculum") {
      setStep("subjects");
      setSelectedSubject(null);
    } else if (step === "subjects") {
      setStep("classes");
      setSelectedClass(null);
      setSubjects([]);
    }
    setError("");
  };

  const goToClasses = () => {
    setStep("classes");
    setSelectedClass(null);
    setSelectedSubject(null);
    setSubjects([]);
    setError("");
  };

  const goToSubjects = () => {
    if (step === "curriculum") {
      setStep("subjects");
      setSelectedSubject(null);
    }
  };

  // ── Resolve class name to curriculumData key ─────────────────────────────
  // Handles cases like "Basic 7A" → "Basic 7", "Basic 7" → "Basic 7"
  const resolveCurriculumKey = (className) => {
    if (!className) return null;
    if (curriculumData[className]) return className;
    // Strip trailing letter suffix: "Basic 7A" → "Basic 7"
    const stripped = className.replace(/\s*[A-Za-z]+$/, "").trim();
    if (curriculumData[stripped]) return stripped;
    // Match "Basic N" anywhere in string
    const match = className.match(/Basic\s*(\d)/i);
    if (match) {
      const key = `Basic ${match[1]}`;
      if (curriculumData[key]) return key;
    }
    return null;
  };

  const getCurriculumRows = () => {
    if (!selectedClass || !selectedSubject) return [];
    const classKey = resolveCurriculumKey(selectedClass.className);
    if (!classKey) return [];
    const subjectData = curriculumData[classKey]?.[selectedSubject.subjectName];
    if (!subjectData) return [];
    return subjectData[activeTerm] || [];
  };

  const curriculumRows = getCurriculumRows();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="curriculum-wrapper">
      <Header />
      <Sidebar />

      <div className="curriculum-container">

        {/* Breadcrumb */}
        <div className="curriculum-breadcrumb">
          <span
            className={step === "classes" ? "crumb active" : "crumb clickable"}
            onClick={goToClasses}
          >
            Classes
          </span>
          {selectedClass && (
            <>
              <span className="crumb-sep">›</span>
              <span
                className={step === "subjects" ? "crumb active" : "crumb clickable"}
                onClick={goToSubjects}
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
          <button className="back-btn" onClick={goBack}>← Back</button>
        )}

        {/* Title + badge */}
        <div className="curriculum-title-row">
          <h2 className="curriculum-heading">
            {step === "classes" && "Select a Class"}
            {step === "subjects" && `Subjects — ${selectedClass?.className}`}
            {step === "curriculum" && "Curriculum"}
          </h2>
          <div className="teacher-type-badge"><span>{teacherType}</span></div>
        </div>

        {/* Error */}
        {error && <div className="curriculum-error">{error}</div>}

        {/* Loading */}
        {loading && <div className="curriculum-loading">Loading...</div>}

        {/* ── STEP 1: Classes ─────────────────────────────────────────────── */}
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

        {/* ── STEP 2: Subjects ────────────────────────────────────────────── */}
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

        {/* ── STEP 3: Curriculum Table ─────────────────────────────────────── */}
        {!loading && step === "curriculum" && (
          <div className="curriculum-content">

            {/* Class + Subject banner */}
            <div className="curriculum-table-header">
              <div className="cth-item">
                <span className="cth-label">Class</span>
                <span className="cth-value">{selectedClass?.className}</span>
              </div>
              <div className="cth-divider" />
              <div className="cth-item">
                <span className="cth-label">Subject</span>
                <span className="cth-value">{selectedSubject?.subjectName}</span>
              </div>
            </div>

            {/* Term tabs */}
            <div className="term-tabs">
              {TERMS.map((term) => (
                <button
                  key={term}
                  className={`term-tab ${activeTerm === term ? "active" : ""}`}
                  onClick={() => setActiveTerm(term)}
                >
                  Term {term}
                </button>
              ))}
            </div>

            {/* Table or empty state */}
            {curriculumRows.length === 0 ? (
              <div className="curriculum-empty-box">
                <span className="empty-icon">📄</span>
                <p>
                  No curriculum data yet for{" "}
                  <strong>{selectedSubject?.subjectName}</strong> —{" "}
                  <strong>{selectedClass?.className}</strong>, Term {activeTerm}.
                </p>
                <p className="empty-hint">
                  Add rows to <code>curriculumData.js</code> to populate this table.
                </p>
              </div>
            ) : (
              <div className="curriculum-table-wrap">
                <table className="curriculum-table">
                  <thead>
                    <tr>
                      <th className="col-week">Week</th>
                      <th className="col-substrand">Sub-Strand</th>
                      <th className="col-standards">Content Standards</th>
                      <th className="col-indicators">Indicators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculumRows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "row-even" : "row-odd"}>
                        <td className="col-week">
                          <span className="week-badge">{row.week}</span>
                        </td>
                        <td className="col-substrand">{row.subStrand}</td>
                        <td className="col-standards">{row.contentStandards}</td>
                        <td className="col-indicators">
                          {Array.isArray(row.indicators) ? (
                            <ul className="indicators-list">
                              {row.indicators.map((ind, i) => (
                                <li key={i}>{ind}</li>
                              ))}
                            </ul>
                          ) : (
                            row.indicators
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Curriculum;