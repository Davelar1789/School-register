import { useState, useEffect } from "react";
import "./EditGrades.modules.css";
import { useLocation } from "react-router-dom";
import { MdAdd, MdDelete } from "react-icons/md";
import axios from '../../../api/axios';
import toast from "react-hot-toast";

const EditGrades = () => {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [subjects, setSubjects] = useState([]);
  
  const subjectList = [
    "Science", "English", "Mathematics", "Social Studies", "Pre-writing Skills", 
    "Numeracy", "Lang. and Lit.", "Creativity", "OWOP", "Computing", 
    "Creative Arts", "RME", "Fante", "Creative A. & Design", "Career Technolgy", "French"
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/api/get-all-classes");
        setClasses(res.data.classes);
      } catch (error) {
        console.log(error);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsByClass = async () => {
        try {
          const res = await axios.get(`/api/get-students-by-class/${selectedClass}`);
          setStudents(res.data.data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchStudentsByClass();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      setStudentDetails(null);
      setSubjects([]);

      const fetchStudentDetails = async () => {
        try {
          const res = await axios.post("/api/student-details", { studentId: selectedStudent });
          setStudentDetails(res.data.data);
          if (res.data.data.subjects.length > 0) {
            setSubjects(res.data.data.subjects);
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchStudentDetails();
    }
  }, [selectedStudent]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "", assessments: [0, 0, 0, 0], exam: 0 }]);
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleAssessmentChange = (subjectIndex, assessmentIndex, value) => {
    const newSubjects = [...subjects];
    const parsedValue = parseFloat(value);

    if (parsedValue >= 0 && parsedValue <= 25) {
      newSubjects[subjectIndex].assessments[assessmentIndex] = parsedValue || 0;
      setSubjects(newSubjects);
    } else {
      toast.error("Class assessment must be between 0 and 25");
    }
  };

  const handleExamChange = (subjectIndex, value) => {
    const newSubjects = [...subjects];
    const parsedValue = parseFloat(value);

    if (parsedValue >= 0 && parsedValue <= 100) {
      newSubjects[subjectIndex].exam = parsedValue || 0;
      setSubjects(newSubjects);
    } else {
      toast.error("Exam score must be between 0 and 100");
    }
  };

  const calculateScores = (assessments, exam) => {
    const classScore = assessments.reduce((a, b) => a + b, 0) * 0.5;
    const examScore = exam * 0.5;
    const totalScore = classScore + examScore;
    return { classScore, examScore, totalScore };
  };

  const handleSaveGrades = async () => {
    try {
      const grades = subjects.map((subject) => {
        const { classScore, examScore, totalScore } = calculateScores(subject.assessments, subject.exam);
        return {
          name: subject.name,
          assessments: subject.assessments,
          exam: subject.exam,
          classScore,
          examScore,
          totalScore,
        };
      });

      await axios.post("/api/save-student-grades", {
        studentId: selectedStudent,
        subjects: grades,
      });
      toast.success("Grades saved successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to save grades");
    }
  };

  return (
    <div className="edit-grades-page">
      <div className="header-section">
        <h2>Edit Grades</h2>
      </div>
      <div className="selection-section">
        <label htmlFor="class-select">Select Class:</label>
        <select id="class-select" onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select a class</option>
          {classes.map((className, index) => (
            <option key={index} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>
      <div className="selection-section">
        <label htmlFor="student-select">Select Student:</label>
        <select
          id="student-select"
          onChange={(e) => setSelectedStudent(e.target.value)}
          disabled={!selectedClass}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>
      {studentDetails && (
        <>
          {subjects.map((subject, subjectIndex) => {
            const { classScore, examScore, totalScore } = calculateScores(
              subject.assessments,
              subject.exam
            );
            return (
              <div key={subjectIndex} className="subject-section">
                <select
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(subjectIndex, "name", e.target.value)}
                  className="subject-select"
                >
                  <option value="">Select a subject</option>
                  {subjectList.map((subjectName, index) => (
                    <option key={index} value={subjectName}>
                      {subjectName}
                    </option>
                  ))}
                </select>
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Class Assessment 1</th>
                      <th>Class Assessment 2</th>
                      <th>Class Assessment 3</th>
                      <th>Class Assessment 4</th>
                      <th>Exam Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {subject.assessments.map((assessment, assessmentIndex) => (
                        <td key={assessmentIndex}>
                          <input
                            type="number"
                            value={assessment || ""}
                            onChange={(e) =>
                              handleAssessmentChange(subjectIndex, assessmentIndex, e.target.value)
                            }
                            className="assessment-input"
                            min="0"
                            max="25"
                          />
                        </td>
                      ))}
                      <td>
                        <input
                          type="number"
                          value={subject.exam || ""}
                          onChange={(e) => handleExamChange(subjectIndex, e.target.value)}
                          className="exam-input"
                          min="0"
                          max="100"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="scores-summary">
                  <table>
                    <thead>
                      <tr>
                        <th>Class Score (50%)</th>
                        <th>Exam Score (50%)</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{classScore.toFixed(2)}</td>
                        <td>{examScore.toFixed(2)}</td>
                        <td>{totalScore.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => handleRemoveSubject(subjectIndex)}
                  className="remove-subject-button"
                >
                  <MdDelete /> Remove Subject
                </button>
                <hr />
              </div>
            );
          })}
          <button onClick={handleAddSubject} className="add-subject-button">
            <MdAdd /> Add Subject
          </button>
          <button onClick={handleSaveGrades} className="save-grades-button">
            Save Grades
          </button>
        </>
      )}
    </div>
  );
};

export default EditGrades;