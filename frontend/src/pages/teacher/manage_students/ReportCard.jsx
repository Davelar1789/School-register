import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import Logo from "../../../assets/images/logo2.png";
import "./ReportCard.modules.css";
import axios from '../../../api/axios';


const ReportCard = () => {
  const location = useLocation();
  const studentDetails = location.state?.student;
  const componentRef = useRef();

  const [year, setYear] = useState("");
  const [vacationDate, setVacationDate] = useState("");
  const [nextTermBegins, setNextTermBegins] = useState("");
  const [attendance, setAttendance] = useState("");
  const [outOf, setOutOf] = useState("");
  const [promotedTo, setPromotedTo] = useState("");
  const [numberOnRoll, setNumberOnRoll] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [conduct, setConduct] = useState("");
  const [interest, setInterest] = useState("");
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [headmasterSignature, setHeadmasterSignature] = useState("");

  const [feesInfo, setFeesInfo] = useState({
    arrears: 0,
    currentFees: 0,
    totalFees: 0
  });

  useEffect(() => {
    // Fetch termly details from the database when the component mounts
    const fetchTermDetails = async () => {
      try {
        const response = await axios.get("/api/get-term-details");
        const data = response.data;
        if (data) {
          setYear(data.year || "2024/2025");
          setVacationDate(data.termEndDate || "");
        }
      } catch (error) {
        console.error("Error fetching term details:", error);
      }
    };
    fetchTermDetails();
  

    if (studentDetails?.subjects) {
      const total = studentDetails.subjects.reduce((sum, subject) => sum + subject.totalScore, 0);
      setTotalMarks(total);
    }

    if (studentDetails?.fees) {
      const currentTerm = "Term 1";
      const termFees = studentDetails.fees.find(fee => fee.term === currentTerm);
      if (termFees) {
        setFeesInfo({
          arrears: termFees.arrears || 0,
          currentFees: termFees.amount || 0,
          totalFees: (termFees.arrears || 0) + (termFees.amount || 0)
        });
      }
    }

    if (studentDetails?.totalAttendance !== undefined) {
      setAttendance(studentDetails.totalAttendance);
    }
  }, [studentDetails]);

  const getRemark = (totalScore) => {
    return totalScore >= 80 ? "EXCELLENT" : "VERY GOOD";
  };

  const getOrdinal = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = number % 100;
    return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="report-card-page">
      <div ref={componentRef}>
        <div className="header-section2">
          <div className="school-logo">
            <img src={Logo} alt="School Logo" />
          </div>
          <div className="school-info">
            <p>JOYFUL BRAINS ACADEMY</p>
            <p>KASOA(AKWELEY), COLUMBA-DOWN</p>
            <p>P.O. BOX KN 2285, KANESHIE-ACCRA</p>
            <p>TEL: 0200833977</p>
          </div>
        </div>
        <h5 className="report3">TERMLY REPORT FORM</h5>
        <div className="form-section">
          {studentDetails && (
            <>
              <div className="form-group-row">
                <label className="l2" htmlFor="student-name">Name:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="student-name"
                    value={studentDetails.name}
                    readOnly
                  />
                </div>
                <label className="l2" htmlFor="year-input">Year:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="year-input"
                    value={year}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group-row">
                <label className="l2" htmlFor="vacation-date-input">Vacation Date:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="vacation-date-input"
                    value={vacationDate}
                    readOnly
                  />
                </div>
                <label className="l2" htmlFor="next-term-begins-input">Next Term Begins:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="next-term-begins-input"
                    value={nextTermBegins}
                    onChange={(e) => setNextTermBegins(e.target.value)}
                  />
                </div>
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
                      <td>{feesInfo.arrears.toFixed(2)}</td>
                      <td>{feesInfo.currentFees.toFixed(2)}</td>
                      <td>{feesInfo.totalFees.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <br /><br /><br />
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
                    {studentDetails.subjects &&
                      studentDetails.subjects.length > 0 &&
                      studentDetails.subjects.map((subject, index) => {
                        const { name, classScore, examScore, totalScore, position } = subject;
                        return (
                          <tr key={index}>
                            <td>{name}</td>
                            <td>{classScore}</td>
                            <td>{examScore}</td>
                            <td>{totalScore}</td>
                            <td>{getOrdinal(position)}</td>
                            <td>{getRemark(totalScore)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="additional-info-section">
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="attendance-input">Attendance:</label>
                    <input
                      type="text"
                      id="attendance-input"
                      value={attendance}
                      readOnly
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
                    <label htmlFor="promoted-to-input">Promoted to:</label>
                    <input
                      type="text"
                      id="promoted-to-input"
                      value={promotedTo}
                      onChange={(e) => setPromotedTo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group-row">
                  <label className="l2" htmlFor="number-on-roll-input">Number on Roll:</label>
                  <div className="form-group">
                    <input
                      type="text"
                      id="number-on-roll-input"
                      value={numberOnRoll}
                      onChange={(e) => setNumberOnRoll(e.target.value)}
                    />
                  </div>
                  <label className="l2" htmlFor="total-marks-input">Total Marks:</label>
                  <div className="form-group">
                    <input
                      type="text"
                      id="total-marks-input"
                      value={totalMarks}
                      readOnly
                    />
                  </div>
                </div>
                <label className="l2" htmlFor="conduct-input">Conduct:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="conduct-input"
                    value={conduct}
                    onChange={(e) => setConduct(e.target.value)}
                  />
                </div>
                <label className="l2" htmlFor="interest-input">Interest:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="interest-input"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                  />
                </div>
                <label className="l2" htmlFor="teacher-remarks-input">Class Teacher's Remarks:</label>
                <div className="form-group">
                  <textarea
                    id="teacher-remarks-input"
                    value={teacherRemarks}
                    onChange={(e) => setTeacherRemarks(e.target.value)}
                  />
                </div>
                <label className="l2" htmlFor="headmaster-signature-input">Headmaster's Signature:</label>
                <div className="form-group">
                  <input
                    type="text"
                    id="headmaster-signature-input"
                    value={headmasterSignature}
                    onChange={(e) => setHeadmasterSignature(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="print-button-container">
        <button onClick={handlePrint} className="print-button">Print Report Card</button>
      </div>
    </div>
  );
};

export default ReportCard;
