import { useState, useEffect } from "react";
import axios from '../../../api/axios';
import { useHistory } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import "./GradeBook.modules.css";

const GradeBook = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();

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
    if (selectedClass) {
      const fetchStudentsByClass = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/get-students-by-class/${selectedClass}`);
          setStudents(res.data.data);
          setLoading(false);
        } catch (error) {
          setError("Failed to fetch students");
          setLoading(false);
        }
      };

      fetchStudentsByClass();
    }
  }, [selectedClass]);

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
          subjects: [...student.subjects, { name: subjectName, classScore: 0, examScore: 0, totalScore: 0 }],
        }))
      );
    } catch (error) {
      setError("Failed to add subject");
    }
  };

  const handleEditSubject = (studentId, subjectName) => {
    history.push({
      pathname: "/edit-grades",
      state: {
        className: selectedClass,
        studentId,
        subjectName,
      },
    });
  };

  return (
    <div className="grade-book-page">
      <div className="header-section">
        <h2>Grade Book</h2>
        {selectedClass && (
          <button onClick={handleAddSubject} className="add-subject-button">
            Add Subject
          </button>
        )}
      </div>
      <div className="selection-section">
        <label htmlFor="class-select">Select Class:</label>
        <select
          id="class-select"
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
              <h3>{student.name}</h3>
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Class Score</th>
                    <th>Exam Score</th>
                    <th>Total Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                {student.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td>{subject.name}</td>
                      <td>{subject.classScore}</td>
                      <td>{subject.examScore}</td>
                      <td>{subject.totalScore}</td>
                      <td>
                        <button
                          onClick={() => handleEditSubject(student._id, subject.name)}
                          className="edit-button"
                        >
                          <MdEdit />
                        </button>
                      </td>
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
