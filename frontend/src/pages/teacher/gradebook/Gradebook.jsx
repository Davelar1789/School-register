import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import "./Gradebook.modules.css"; // responsive styling handled here

const getDataFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return {
      teacherId: decodedToken?.id || null,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const Gradebook = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const teacherData = getDataFromToken();
  const teacherId = teacherData?.teacherId;

  const fetchClasses = async () => {
    if (!token) return;

    try {
      const res = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(Array.isArray(res.data.classes) ? res.data.classes : []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (classId) => {
    if (!token || !teacherId) return;

    try {
      const res = await axios.get(
        `/api/teachers/${teacherId}/subjects?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjects(Array.isArray(res.data.subjects) ? res.data.subjects : []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchStudents = async (classId, subjectId) => {
    if (!token) return;

    try {
      const res = await axios.get(
        `/api/grades/students?classId=${classId}&subjectId=${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const fetchedStudents = Array.isArray(res.data.students)
        ? res.data.students
        : [];

      setStudents(fetchedStudents);

      const initialGrades = {};
      fetchedStudents.forEach((student) => {
        initialGrades[student._id] = {
          test1: 0,
          test2: 0,
          test3: 0,
          test4: 0,
          exam: 0,
        };
      });
      setGrades(initialGrades);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    const numericValue = Number(value);
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numericValue,
      },
    }));
  };

  useEffect(() => {
    if (token && teacherId) {
      fetchClasses();
    } else {
      setLoading(false);
    }
  }, [token, teacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents(selectedClass, selectedSubject);
    }
  }, [selectedClass, selectedSubject]);

  return (
    <div className="gradebook-container">
      <h2>Gradebook</h2>

      <div className="dropdown-row">
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSubject("");
            setStudents([]);
          }}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={!selectedClass}
        >
          <option value="">Select Subject</option>
          {subjects.map((subj) => (
            <option key={subj._id} value={subj._id}>
              {subj.subjectName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        students.length > 0 && (
          <div className="table-container">
            <table className="gradebook-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Test 1 (10)</th>
                  <th>Test 2 (10)</th>
                  <th>Test 3 (10)</th>
                  <th>Test 4 (20)</th>
                  <th>Exam (100)</th>
                  <th>Total</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentGrades = grades[student._id] || {};
                  const total =
                    (studentGrades.test1 || 0) +
                    (studentGrades.test2 || 0) +
                    (studentGrades.test3 || 0) +
                    (studentGrades.test4 || 0) +
                    (studentGrades.exam || 0);
                  return (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>
                        <input
                          type="number"
                          max="10"
                          value={studentGrades.test1 || 0}
                          onChange={(e) =>
                            handleGradeChange(student._id, "test1", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          max="10"
                          value={studentGrades.test2 || 0}
                          onChange={(e) =>
                            handleGradeChange(student._id, "test2", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          max="10"
                          value={studentGrades.test3 || 0}
                          onChange={(e) =>
                            handleGradeChange(student._id, "test3", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          max="20"
                          value={studentGrades.test4 || 0}
                          onChange={(e) =>
                            handleGradeChange(student._id, "test4", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          max="100"
                          value={studentGrades.exam || 0}
                          onChange={(e) =>
                            handleGradeChange(student._id, "exam", e.target.value)
                          }
                        />
                      </td>
                      <td>{total}</td>
                      <td>-</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default Gradebook;
