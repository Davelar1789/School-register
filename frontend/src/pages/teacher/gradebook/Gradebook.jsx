import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
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
  const [visibleColumn, setVisibleColumn] = useState("all");


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
    } finally {
      setLoading(false);
    }
  };

 
const fetchSubjects = async (classId) => {
  if (!token || !teacherId) {
    return;
  }
  try {
    console.log("Making GET request to /api/teachers/${teacherId}/subjects2");
    const res = await axios.get(
      `/api/teachers/${teacherId}/subjects2?classId=${classId}`,
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

  const maxValues = {
    test1: 10,
    test2: 10,
    test3: 10,
    test4: 20,
    exam: 100,
  };

 if (numericValue !== "" && numericValue > maxValues[field]) {
  toast.error(`The maximum allowed value for ${field.toUpperCase()} is ${maxValues[field]}`);
  return;
}


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
      (g.test1 || 0) +
      (g.test2 || 0) +
      (g.test3 || 0) +
      (g.test4 || 0);

    const examHalf = (g.exam || 0) / 2;
const total = Math.round(testSum + examHalf);
    return {
      studentId: student.studentId,
      total,
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

const formatPosition = (pos) => {
  const suffix = (n) => {
    if (n % 100 >= 11 && n % 100 <= 13) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  return pos ? `${pos}${suffix(pos)}` : "";
};


const handleSaveGrades = async () => {
 if (!selectedClass || !selectedSubject || !currentTerm?._id || !grades) {
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
        position: formatPosition(positionMap[studentId])
      })),
    };

    await axios.post("/api/grades/grades", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Grades saved successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Error saving grades:", error);
    toast.error("Failed to save grades.");
}
};



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
    <div>
        <Sidebar />
        <Header />
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
    visibleColumn === "all"
      ? "all-columns"
      : visibleColumn
      ? "few-columns"
      : ""
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
                  {(visibleColumn === "all") && <th>Total</th>}
                  {(visibleColumn === "all") && <th>Position</th>}
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
    const total = Math.round(testTotal + examScore / 2);
    const position = positionMap[student.studentId] || "-";

    return (
      <tr key={student.studentId}>
        <td>{student.name}</td>

        {(visibleColumn === "all" || visibleColumn === "test1") && (
          <td><input type="number" max="10" value={studentGrades.test1 || ""} onChange={(e) => handleGradeChange(student.studentId, "test1", e.target.value)} /></td>
        )}

        {(visibleColumn === "all" || visibleColumn === "test2") && (
          <td><input type="number" max="10" value={studentGrades.test2 || ""} onChange={(e) => handleGradeChange(student.studentId, "test2", e.target.value)} /></td>
        )}

        {(visibleColumn === "all" || visibleColumn === "test3") && (
          <td><input type="number" max="10" value={studentGrades.test3 || ""} onChange={(e) => handleGradeChange(student.studentId, "test3", e.target.value)} /></td>
        )}

        {(visibleColumn === "all" || visibleColumn === "test4") && (
          <td><input type="number" max="20" value={studentGrades.test4 || ""} onChange={(e) => handleGradeChange(student.studentId, "test4", e.target.value)} /></td>
        )}

        {(visibleColumn === "all" || visibleColumn === "exam") && (
          <td><input type="number" max="100" value={studentGrades.exam || ""} onChange={(e) => handleGradeChange(student.studentId, "exam", e.target.value)} /></td>
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
    </div>
        </div>
  );
};

export default Gradebook;
