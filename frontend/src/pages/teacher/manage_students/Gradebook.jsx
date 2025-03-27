import { useState, useEffect } from "react";
import axios from '../../../api/axios';
import { useNavigate, useLocation } from "react-router-dom";
import "./GradeBook.modules.css";

const GradeBook = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/api/get-all-classes");
        setClasses(res.data.classes);
      } catch (error) {
        setError("Failed to fetch classes");
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const className = location.state?.className || selectedClass;
    if (className) {
      const fetchStudentsByClass = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/get-students-by-class/${className}`);
          setStudents(res.data.data);
          setSelectedClass(className);
          setLoading(false);
        } catch (error) {
          setError("Failed to fetch students");
          setLoading(false);
        }
      };

      fetchStudentsByClass();
    }
  }, [location.state, selectedClass]);

  const handleAddSubject = async () => {
    const subjectName = prompt("Enter the subject name:");
    if (!subjectName) return;

    try {
      await axios.post("/api/add-subject-to-class", {
        className: selectedClass,
        subjectName,
      });

      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          subjects: [
            ...student.subjects,
            { name: subjectName, classScore: 0, examScore: 0, totalScore: 0, position: 0 },
          ],
        }))
      );
    } catch (error) {
      setError("Failed to add subject");
    }
  };

  const handleEditSubject = (studentId, subjectName) => {
    navigate("/teacher/edit-grades", {
      state: {
        className: selectedClass,
        studentId,
        subjectName,
      },
    });
  };

  const handleReportCard = (student) => {
    navigate("/teacher/report-card", {
      state: {
        student,
      },
    });
  };

  const getOrdinal = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = number % 100;
    return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const calculatePositions = (students) => {
    const subjectPositions = {};

    students.forEach((student) => {
      student.subjects.forEach((subject) => {
        if (!subjectPositions[subject.name]) {
          subjectPositions[subject.name] = [];
        }
        subjectPositions[subject.name].push({
          studentId: student._id,
          totalScore: subject.totalScore,
        });
      });
    });

    const studentPositions = {};

    for (const subjectName in subjectPositions) {
      const sortedScores = subjectPositions[subjectName]
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((student, index) => ({
          ...student,
          position: index + 1,
        }));

      sortedScores.forEach((student) => {
        if (!studentPositions[student.studentId]) {
          studentPositions[student.studentId] = {};
        }
        studentPositions[student.studentId][subjectName] = student.position;
      });
    }

    return studentPositions;
  };

  const saveStudentPositions = async (students, positions) => {
    try {
      await Promise.all(
        students.map((student) =>
          axios.put(`/api/update-student/${student._id}`, {
            subjects: student.subjects.map((subject) => ({
              ...subject,
              position: positions[student._id][subject.name],
            })),
          })
        )
      );
    } catch (error) {
      setError("");
    }
  };

  useEffect(() => {
    if (students.length > 0) {
      const positions = calculatePositions(students);
      saveStudentPositions(students, positions);
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          subjects: student.subjects.map((subject) => ({
            ...subject,
            position: positions[student._id][subject.name],
          })),
        }))
      );
    }
  }, [students]);

  return (
    <div className="grade-book-page">
      <div className="header-section">
        <h2>Grade Book</h2>
      </div>
      <div className="selection-section">
        <label htmlFor="class-select">Select Class:</label>
        <select
          id="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select a class</option>
          {classes.map((className, index) => (
            <option key={index} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {students.length > 0 && (
        <div className="students-section">
          {students.map((student) => (
            <div key={student._id} className="student-details">
              <h3>
                {student.name}{" "}
                <button className="report-button" onClick={() => handleReportCard(student)}>
                  View Report Card
                </button>
              </h3>
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Class Score (50%)</th>
                    <th>Exam Score (50%)</th>
                    <th>Total</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {student.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td>{subject.name}</td>
                      <td>{subject.classScore.toFixed(2)}</td>
                      <td>{subject.examScore.toFixed(2)}</td>
                      <td>{subject.totalScore.toFixed(2)}</td>
                      <td>{subject.position ? getOrdinal(subject.position) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeBook;
