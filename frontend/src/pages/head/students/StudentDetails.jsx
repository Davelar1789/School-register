import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios"; // Your Axios instance
import "./StudentDetails.modules.css";

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/student/free/${id}`);
        setStudent(res.data);
      } catch (err) {
        // console.error(err);
      }
    };
    fetchStudent();
  }, [id]);

  if (!student) {
    return <div className="student-details-page">Loading student details...</div>;
  }

  const latestAcademic = student.academicRecords?.[student.academicRecords.length - 1];
  const latestTerm = latestAcademic?.terms?.[latestAcademic.terms.length - 1];
  const fees = latestTerm?.fees;

  return (
    <div className="student-details-page">
      <h2 className="student-title">Student Profile</h2>

      <div className="student-card">
        <div className="student-info">
          <div className="info-pair">
            <span className="label">Full Name:</span>
            <span className="value">{student.name}</span>
          </div>
          <div className="info-pair">
            <span className="label">Class:</span>
            <span className="value">
              {student.classes?.[0]?.className || "N/A"}
            </span>
          </div>
          <div className="info-pair">
            <span className="label">ID No:</span>
            <span className="value">{student.idno}</span>
          </div>
          <div className="info-pair">
            <span className="label">Date of Birth:</span>
            <span className="value">{student.dob}</span>
          </div>
          <div className="info-pair">
            <span className="label">Phone:</span>
            <span className="value">{student.phone || "N/A"}</span>
          </div>
          <div className="info-pair">
            <span className="label">Address:</span>
            <span className="value">{student.address || "N/A"}</span>
          </div>
        </div>

        <div className="fees-info">
          <h3 className="section-title">Fees Info</h3>
          {fees ? (
            <>
              <div className="info-pair">
                <span className="label">Total Fees:</span>
                <span className="value">₵{fees.totalFees}</span>
              </div>
              <div className="info-pair">
                <span className="label">Amount Paid:</span>
                <span className="value">₵{fees.amountPaid}</span>
              </div>
              <div className="info-pair">
                <span className="label">Arrears:</span>
                <span className="value">₵{fees.arrears}</span>
              </div>
              <div className="info-pair">
                <span className="label">Balance:</span>
                <span className="value">₵{fees.balance}</span>
              </div>
            </>
          ) : (
            <p className="no-fees">No fees info available for this term.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
