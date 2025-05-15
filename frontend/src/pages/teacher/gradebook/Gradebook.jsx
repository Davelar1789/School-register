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
      schoolId: decodedToken?.schoolId || null,
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
  const [positionMap, setPositionMap] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grades, setGrades] = useState({});
  const [currentTerm, setCurrentTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const teacherData = getDataFromToken();
  const teacherId = teacherData?.teacherId;
  const schoolId = teacherData?.schoolId;

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

const fetchStudents = async (classId, subjectId) => {
  if (!token || !currentTerm?._id) return;

  try {
    const res = await axios.get(
      `/api/grades/grades?classId=${classId}&subjectId=${subjectId}&termId=${currentTerm._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const fetchedStudents = Array.isArray(res.data) ? res.data : [];

    setStudents(fetchedStudents);

    const initialGrades = {};
    fetchedStudents.forEach((student) => {
      initialGrades[student.studentId] = student.scores;
    });
    setGrades(initialGrades);
  } catch (err) {
    console.error("Error fetching students:", err);
  }
};


  const handleGradeChange = (studentId, field, value) => {
  const numericValue = value === "" ? "" : Number(value);
  setGrades((prev) => ({
    ...prev,
    [studentId]: {
      ...prev[studentId],
      [field]: numericValue,
    },
  }));
};

const calculateTotalsWithPositions = (grades, students) => {
  const studentTotals = students.map((student) => {
    const g = grades[student.studentId] || {};
    const testSum =
      Number(g.test1 || 0) +
      Number(g.test2 || 0) +
      Number(g.test3 || 0) +
      Number(g.test4 || 0);
    const examHalf = Number(g.exam || 0) / 2;

    return {
      studentId: student.studentId,
      total: testSum + examHalf,
    };
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


useEffect(() => {
  if (students.length > 0) {
    const newPositionMap = calculateTotalsWithPositions(grades, students);
    setPositionMap(newPositionMap);
  }
}, [grades, students]);



  useEffect(() => {
    if (token && teacherId) {
      fetchClasses();
      fetchCurrentTerm();
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
    if (selectedClass && selectedSubject && currentTerm?._id) {
      fetchStudents(selectedClass, selectedSubject);
    }
  }, [selectedClass, selectedSubject, currentTerm]);

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
           <option key={subj.subjectId} value={subj.subjectId}>
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
    const studentGrades = grades[student.studentId] || {};

    const testTotal =
      (Number(studentGrades.test1) || 0) +
      (Number(studentGrades.test2) || 0) +
      (Number(studentGrades.test3) || 0) +
      (Number(studentGrades.test4) || 0);

    const examScore = Number(studentGrades.exam) || 0;
    const total = testTotal + examScore / 2;

    const position = positionMap[student.studentId] || "-";

    return (
      <tr key={student.studentId}>
        <td>{student.name}</td>
        <td>
          <input
            type="number"
            max="10"
            value={studentGrades.test1 === 0 ? "" : studentGrades.test1 || ""}
            onChange={(e) =>
              handleGradeChange(student.studentId, "test1", e.target.value)
            }
          />
        </td>
        <td>
          <input
            type="number"
            max="10"
            value={studentGrades.test2 === 0 ? "" : studentGrades.test2 || ""}
            onChange={(e) =>
              handleGradeChange(student.studentId, "test2", e.target.value)
            }
          />
        </td>
        <td>
          <input
            type="number"
            max="10"
            value={studentGrades.test3 === 0 ? "" : studentGrades.test3 || ""}
            onChange={(e) =>
              handleGradeChange(student.studentId, "test3", e.target.value)
            }
          />
        </td>
        <td>
          <input
            type="number"
            max="20"
            value={studentGrades.test4 === 0 ? "" : studentGrades.test4 || ""}
            onChange={(e) =>
              handleGradeChange(student.studentId, "test4", e.target.value)
            }
          />
        </td>
        <td>
          <input
            type="number"
            max="100"
            value={studentGrades.exam === 0 ? "" : studentGrades.exam || ""}
            onChange={(e) =>
              handleGradeChange(student.studentId, "exam", e.target.value)
            }
          />
        </td>
        <td>{total}</td>
        <td>{position}</td>
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
