import { useState, useEffect } from "react";
import "./ReportCard.modules.css";
import axios from '../../../api/axios';

const ReportCard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [year, setYear] = useState("");
  const [vacationDate, setVacationDate] = useState("");
  const [nextTermBegins, setNextTermBegins] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [attendance, setAttendance] = useState("");
  const [outOf, setOutOf] = useState("");
  const [promotedTo, setPromotedTo] = useState("");
  const [numberOnRoll, setNumberOnRoll] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [conduct, setConduct] = useState("");
  const [interest, setInterest] = useState("");
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [headmasterSignature, setHeadmasterSignature] = useState("");

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
      const fetchStudentDetails = async () => {
        try {
          const res = await axios.get(`/api/get-student-details/${selectedStudent}`);
          console.log("Student Details Response:", res.data);
          setStudentDetails(res.data.student);
        } catch (error) {
          console.log(error);
        }
      };

      fetchStudentDetails();
    }
  }, [selectedStudent]);

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="report-card-page">
      <div className="header-section">
        <div className="school-logo">
          <img src="/path/to/logo.png" alt="School Logo" />
        </div>
        <div className="school-info">
          <h1>JOYFUL BRAINS ACADEMY</h1>
          <p>KASOA(AKWELEY), COLUMBA-DOWN</p>
          <p>P.O. BOX KN 2285, KANESHIE-ACCRA</p>
          <p>TEL: 0200833977</p>
        </div>
      </div>
      <h2>TERMLY REPORT FORM</h2>
      <div className="form-section">
        <div className="form-group">
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
        {selectedClass && (
          <>
            <div className="form-group">
              <label htmlFor="student-select">Select Student:</label>
              <select id="student-select" onChange={(e) => setSelectedStudent(e.target.value)}>
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="year-input">Year:</label>
              <input
                type="text"
                id="year-input"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vacation-date-input">Vacation Date:</label>
              <input
                type="date"
                id="vacation-date-input"
                value={vacationDate}
                onChange={(e) => setVacationDate(e.target.value)}
              />
              <span>{vacationDate && formatDate(vacationDate)}</span>
            </div>
            <div className="form-group">
              <label htmlFor="next-term-begins-input">Next Term Begins:</label>
              <input
                type="date"
                id="next-term-begins-input"
                value={nextTermBegins}
                onChange={(e) => setNextTermBegins(e.target.value)}
              />
              <span>{nextTermBegins && formatDate(nextTermBegins)}</span>
            </div>
            <div className="form-group">
              <table className="fees-table">
                <thead>
                  <tr>
                    <th>Arrears (GHC)</th>
                    <th>Fees for the Term (GHC)</th>
                    <th>Total Fees (GHC)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="report-section">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Class Score</th>
                    <th>Exam Score</th>
                    <th>Total Score</th>
                    <th>Position</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentDetails && studentDetails.subjects && studentDetails.subjects.length > 0 ? (
                    studentDetails.subjects.map((subject, index) => (
                      <tr key={index}>
                        <td>{subject.name}</td>
                        <td>{subject.classScore}</td>
                        <td>{subject.examScore}</td>
                        <td>{subject.totalScore}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No subjects available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="additional-info">
                <div className="form-group">
                  <label htmlFor="attendance-input">Attendance:</label>
                  <input
                    type="text"
                    id="attendance-input"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="out-of-input">Out of:</label>
                  <input
                    type="text"
                    id="out-of-input"
                    value={outOf}
                    onChange={(e) => setOutOf(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="promoted-to-input">Promoted To:</label>
                  <input
                    type="text"
                    id="promoted-to-input"
                    value={promotedTo}
                    onChange={(e) => setPromotedTo(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="number-on-roll-input">Number on Roll:</label>
                  <input
                    type="text"
                    id="number-on-roll-input"
                    value={numberOnRoll}
                    onChange={(e) => setNumberOnRoll(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="total-marks-input">Total Marks:</label>
                  <input
                    type="text"
                    id="total-marks-input"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="conduct-input">Conduct:</label>
                  <input
                    type="text"
                    id="conduct-input"
                    value={conduct}
                    onChange={(e) => setConduct(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="interest-input">Interest:</label>
                  <input
                    type="text"
                    id="interest-input"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="teacher-remarks-input">Class Teacher's Remarks:</label>
                  <textarea
                    id="teacher-remarks-input"
                    value={teacherRemarks}
                    onChange={(e) => setTeacherRemarks(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="headmaster-signature-input">Headmaster's Signature:</label>
                  <input
                    type="text"
                    id="headmaster-signature-input"
                    value={headmasterSignature}
                    onChange={(e) => setHeadmasterSignature(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
