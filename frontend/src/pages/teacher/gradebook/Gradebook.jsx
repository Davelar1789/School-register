import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Gradebook.modules.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const EARLY_YEARS_LEVELS = ["creche", "nursery"];

const ACTIVITIES = [
  "Speaks clearly",
  "Holds pencil/crayon properly",
  "Scribbles well",
  "Traces well",
  "Colours within lines",
  "Participates in songs and rhymes",
  "Responds to simple instructions",
  "Expresses needs and feelings clearly",
  "Plays well with others",
  "Cooperates during dressing",
];

const RATINGS = ["Excellent", "Very Good", "Good", "Needs Improvement"];

const RATING_SYMBOLS = {
  Excellent: "★",
  "Very Good": "✦",
  Good: "✓",
  "Needs Improvement": "○",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDataFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return {
      teacherId: decodedToken?.id || null,
      schoolId: decodedToken?.schoolId || null,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const isEarlyYears = (className = "") =>
  EARLY_YEARS_LEVELS.some((lvl) => className.toLowerCase().includes(lvl));

const formatPosition = (pos) => {
  if (!pos) return "";
  const suffix = (n) => {
    if (n % 100 >= 11 && n % 100 <= 13) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  return `${pos}${suffix(pos)}`;
};

// ─── Early Years Ticking Table (per student) ──────────────────────────────────

const StudentTickCard = ({ student, ticks, onTick }) => {
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="tick-card">
      <div className="tick-card-header">
        <div className="student-avatar">{getInitials(student.name)}</div>
        <div className="student-info">
          <span className="student-name">{student.name}</span>
        </div>
        <div className="tick-progress">
          <span className="progress-label">
            {Object.keys(ticks || {}).length} / {ACTIVITIES.length} rated
          </span>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{
                width: `${
                  ((Object.keys(ticks || {}).length) / ACTIVITIES.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="tick-table-wrap">
        <table className="tick-table">
          <thead>
            <tr>
              <th className="activity-col">Activity</th>
              {RATINGS.map((r) => (
                <th key={r} className={`rating-col rating-${r.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span className="rating-symbol">{RATING_SYMBOLS[r]}</span>
                  <span className="rating-label">{r}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVITIES.map((activity, idx) => (
              <tr
                key={activity}
                className={`tick-row ${idx % 2 === 0 ? "even" : "odd"} ${
                  ticks?.[activity] ? "rated" : ""
                }`}
              >
                <td className="activity-name">{activity}</td>
                {RATINGS.map((rating) => (
                  <td key={rating} className="tick-cell">
                    <label className={`tick-label ${ticks?.[activity] === rating ? "checked" : ""}`}>
                      <input
                        type="radio"
                        name={`${student.studentId}-${activity}`}
                        value={rating}
                        checked={ticks?.[activity] === rating}
                        onChange={() => onTick(student.studentId, activity, rating)}
                      />
                      <span className="tick-box">
                        {ticks?.[activity] === rating && (
                          <span className="tick-check">{RATING_SYMBOLS[rating]}</span>
                        )}
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Gradebook Component ─────────────────────────────────────────────────

const Gradebook = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [positionMap, setPositionMap] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grades, setGrades] = useState({});
  const [ticks, setTicks] = useState({}); // { studentId: { activity: rating } }
  const [currentTerm, setCurrentTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleColumn, setVisibleColumn] = useState("all");

  const token = localStorage.getItem("token");
  const teacherData = getDataFromToken();
  const teacherId = teacherData?.teacherId;
  const schoolId = teacherData?.schoolId;

  // Derive whether the selected class is early-years
  const selectedClassObj = classes.find((c) => c._id === selectedClass);
  const earlyYears = selectedClassObj ? isEarlyYears(selectedClassObj.className) : false;

  // ── Fetchers ────────────────────────────────────────────────────────────────

  const fetchClasses = async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(Array.isArray(res.data.classes) ? res.data.classes : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (classId) => {
    if (!token || !teacherId) return;
    try {
      const res = await axios.get(
        `/api/teachers/${teacherId}/subjects2?classId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rawSubjects = Array.isArray(res.data.subjects) ? res.data.subjects : [];
      const uniqueSubjects = [];
      const seenNames = new Set();
      for (const subj of rawSubjects) {
        if (!seenNames.has(subj.subjectName)) {
          seenNames.add(subj.subjectName);
          uniqueSubjects.push(subj);
        }
      }
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchCurrentTerm = async () => {
    if (!schoolId || !token) return;
    try {
      const { data } = await axios.get("/api/terms/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentTerm(data);
    } catch (error) {
      console.error("Error fetching current term:", error);
    }
  };

  // Fetch students for regular classes (with subject)
  const fetchStudents = async (classId, subjectId) => {
    if (!token || !currentTerm?._id) return;
    try {
      const res = await axios.get(
        `/api/grades/grades?classId=${classId}&subjectId=${subjectId}&termId=${currentTerm._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetched = Array.isArray(res.data) ? res.data : [];
      setStudents(fetched);
      const initialGrades = {};
      fetched.forEach((s) => { initialGrades[s.studentId] = s.scores; });
      setGrades(initialGrades);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Fetch students for early-years classes (no subject)
  const fetchEarlyYearsStudents = async (classId) => {
    if (!token || !currentTerm?._id) return;
    try {
      // Fetch the student list for the class; adapt endpoint as needed
      const res = await axios.get(
        `/api/grades/early-years?classId=${classId}&termId=${currentTerm._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetched = Array.isArray(res.data) ? res.data : [];
      setStudents(fetched);

      // Pre-populate ticks if server returns saved data
      const initialTicks = {};
      fetched.forEach((s) => {
        initialTicks[s.studentId] = s.ticks || {};
      });
      setTicks(initialTicks);
    } catch (err) {
      console.error("Error fetching early-years students:", err);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleGradeChange = (studentId, field, value) => {
    const numericValue = value === "" ? "" : Number(value);
    const maxValues = { test1: 10, test2: 10, test3: 10, test4: 20, exam: 100 };
    if (numericValue !== "" && numericValue > maxValues[field]) {
      toast.error(`Maximum for ${field.toUpperCase()} is ${maxValues[field]}`);
      return;
    }
    setGrades((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: numericValue },
    }));
  };

  const handleTick = (studentId, activity, rating) => {
    setTicks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [activity]: rating },
    }));
  };

  const calculateTotalsWithPositions = (grades, students) => {
    const studentTotals = students.map((student) => {
      const g = grades[student.studentId] || {};
      const testSum = (g.test1 || 0) + (g.test2 || 0) + (g.test3 || 0) + (g.test4 || 0);
      const total = Math.round(testSum + (g.exam || 0) / 2);
      return { studentId: student.studentId, total };
    });
    studentTotals.sort((a, b) => b.total - a.total);
    const positions = {};
    let currentPos = 1;
    for (let i = 0; i < studentTotals.length; i++) {
      const current = studentTotals[i];
      const previous = studentTotals[i - 1];
      if (i === 0) {
        positions[current.studentId] = currentPos;
      } else if (current.total === previous.total) {
        positions[current.studentId] = positions[previous.studentId];
      } else {
        currentPos = i + 1;
        positions[current.studentId] = currentPos;
      }
    }
    return positions;
  };

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedSubject || !currentTerm?._id) {
      toast.error("Please select class, subject and make sure grades are available.");
      return;
    }
    try {
      const payload = {
        classId: selectedClass,
        subjectId: selectedSubject,
        termId: currentTerm._id,
        grades: Object.keys(grades).map((studentId) => ({
          studentId,
          scores: grades[studentId],
          position: formatPosition(positionMap[studentId]),
        })),
      };
      await axios.post("/api/grades/grades", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Grades saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades.");
    }
  };

  const handleSaveEarlyYears = async () => {
    if (!selectedClass || !currentTerm?._id) {
      toast.error("Please select a class.");
      return;
    }
    // Check all students have all activities ticked
    const incomplete = students.filter(
      (s) => Object.keys(ticks[s.studentId] || {}).length < ACTIVITIES.length
    );
    if (incomplete.length > 0) {
      toast.error(
        `${incomplete.length} student(s) still have unrated activities. Please complete all before saving.`
      );
      return;
    }
    try {
      const payload = {
        classId: selectedClass,
        termId: currentTerm._id,
        reports: students.map((s) => ({
          studentId: s.studentId,
          ticks: ticks[s.studentId] || {},
        })),
      };
      await axios.post("/api/grades/early-years", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Reports saved successfully!");
    } catch (error) {
      console.error("Error saving early-years reports:", error);
      toast.error("Failed to save reports.");
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (token && teacherId) {
      fetchClasses();
      fetchCurrentTerm();
    } else {
      setLoading(false);
    }
  }, [token, teacherId]);

  useEffect(() => {
    if (selectedClass && !earlyYears) {
      fetchSubjects(selectedClass);
    }
    // Reset state on class change
    setSelectedSubject("");
    setStudents([]);
    setGrades({});
    setTicks({});
  }, [selectedClass]);

  useEffect(() => {
    if (!currentTerm?._id) return;
    if (earlyYears && selectedClass) {
      fetchEarlyYearsStudents(selectedClass);
    }
  }, [earlyYears, selectedClass, currentTerm]);

  useEffect(() => {
    if (selectedClass && selectedSubject && currentTerm?._id && !earlyYears) {
      fetchStudents(selectedClass, selectedSubject);
    }
  }, [selectedClass, selectedSubject, currentTerm]);

  useEffect(() => {
    if (students.length > 0 && !earlyYears) {
      setPositionMap(calculateTotalsWithPositions(grades, students));
    }
  }, [grades, students]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <Sidebar />
      <Header />
      <div className="gradebook-container">
        <h2>Gradebook</h2>

        {/* Class selector — always shown */}
        <div className="dropdown-row">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>

          {/* Subject selector — hidden for early-years */}
          {!earlyYears && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">Select Subject</option>
              {subjects.map((subj) => (
                <option key={subj.subjectId} value={subj.subjectId}>
                  {subj.subjectName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Early-Years Mode ── */}
        {earlyYears && selectedClass && (
          <div className="early-years-section">
            {/* Mode badge */}
            <div className="ey-mode-badge">
              <span className="ey-badge-icon">🌱</span>
              <div>
                <span className="ey-badge-title">Early Years Report Mode</span>
                <span className="ey-badge-subtitle">
                  Tick one rating per activity for each student
                </span>
              </div>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : students.length === 0 ? (
              <p className="no-students">No students found for this class.</p>
            ) : (
              <>
                {/* Legend */}
                <div className="ey-legend">
                  {RATINGS.map((r) => (
                    <span key={r} className={`legend-pill legend-${r.toLowerCase().replace(/\s+/g, "-")}`}>
                      {RATING_SYMBOLS[r]} {r}
                    </span>
                  ))}
                </div>

                {/* Student cards */}
                <div className="tick-cards-list">
                  {students.map((student) => (
                    <StudentTickCard
                      key={student.studentId}
                      student={student}
                      ticks={ticks[student.studentId] || {}}
                      onTick={handleTick}
                    />
                  ))}
                </div>

                <button className="save-button ey-save-button" onClick={handleSaveEarlyYears}>
                  Save All Reports
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Regular Gradebook Mode ── */}
        {!earlyYears && (
          <>
            {/* Column visibility selector */}
            <div className="column-selector">
              <label className="view-color">View:</label>
              <select
                value={visibleColumn}
                onChange={(e) => setVisibleColumn(e.target.value)}
              >
                <option value="all">All Columns</option>
                <option value="test1">Test 1</option>
                <option value="test2">Test 2</option>
                <option value="test3">Test 3</option>
                <option value="test4">Test 4</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              students.length > 0 && (
                <div className="table-container">
                  <table
                    className={`gradebook-table ${
                      visibleColumn === "all" ? "all-columns" : "few-columns"
                    }`}
                  >
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        {(visibleColumn === "all" || visibleColumn === "test1") && <th>Test 1 (10)</th>}
                        {(visibleColumn === "all" || visibleColumn === "test2") && <th>Test 2 (10)</th>}
                        {(visibleColumn === "all" || visibleColumn === "test3") && <th>Test 3 (10)</th>}
                        {(visibleColumn === "all" || visibleColumn === "test4") && <th>Test 4 (20)</th>}
                        {(visibleColumn === "all" || visibleColumn === "exam") && <th>Exam (100)</th>}
                        {visibleColumn === "all" && <th>Total</th>}
                        {visibleColumn === "all" && <th>Position</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const g = grades[student.studentId] || {};
                        const testTotal =
                          (Number(g.test1) || 0) +
                          (Number(g.test2) || 0) +
                          (Number(g.test3) || 0) +
                          (Number(g.test4) || 0);
                        const total = Math.round(testTotal + (Number(g.exam) || 0) / 2);
                        const position = positionMap[student.studentId] || "-";

                        return (
                          <tr key={student.studentId}>
                            <td>{student.name}</td>
                            {(visibleColumn === "all" || visibleColumn === "test1") && (
                              <td><input type="number" max="10" value={g.test1 || ""} onChange={(e) => handleGradeChange(student.studentId, "test1", e.target.value)} onWheel={(e) => e.target.blur()} /></td>
                            )}
                            {(visibleColumn === "all" || visibleColumn === "test2") && (
                              <td><input type="number" max="10" value={g.test2 || ""} onChange={(e) => handleGradeChange(student.studentId, "test2", e.target.value)} onWheel={(e) => e.target.blur()} /></td>
                            )}
                            {(visibleColumn === "all" || visibleColumn === "test3") && (
                              <td><input type="number" max="10" value={g.test3 || ""} onChange={(e) => handleGradeChange(student.studentId, "test3", e.target.value)} onWheel={(e) => e.target.blur()} /></td>
                            )}
                            {(visibleColumn === "all" || visibleColumn === "test4") && (
                              <td><input type="number" max="20" value={g.test4 || ""} onChange={(e) => handleGradeChange(student.studentId, "test4", e.target.value)} onWheel={(e) => e.target.blur()} /></td>
                            )}
                            {(visibleColumn === "all" || visibleColumn === "exam") && (
                              <td><input type="number" max="100" value={g.exam || ""} onChange={(e) => handleGradeChange(student.studentId, "exam", e.target.value)} onWheel={(e) => e.target.blur()} /></td>
                            )}
                            {visibleColumn === "all" && <td>{total}</td>}
                            {visibleColumn === "all" && <td>{position}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            <button className="save-button" onClick={handleSaveGrades}>
              Save Grades
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Gradebook;
