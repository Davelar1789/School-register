import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import moment from "moment";
import "./StudentDetails.modules.css";

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/api/student/free/${id}`);
        setStudent(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student:", error);
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) return <div className="loading">Loading student details...</div>;
  if (!student) return <div className="error">Student not found.</div>;

  const { name, idno, dob, phone, address, classes, academicRecords } = student;

  // Get latest academic year and term
  const latestYear = academicRecords?.[academicRecords.length - 1];
  const latestTerm = latestYear?.terms?.[latestYear.terms.length - 1];
  const fees = latestTerm?.fees;

  return (
    <div className="student-details-container">
      <h2 className="section-title">Student Details</h2>

      <div className="student-info-card">
        <h3>Basic Information</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>ID No:</strong> {idno}</p>
        <p><strong>Date of Birth:</strong> {dob}</p>
        <p><strong>Phone:</strong> {phone || "N/A"}</p>
        <p><strong>Address:</strong> {address || "N/A"}</p>
        <p><strong>Class:</strong> {classes?.[0]?.className || "N/A"}</p>
      </div>

      {fees && (
        <div className="student-fees-card">
          <h3>Fees Summary – {latestYear.yearLabel}, {latestTerm.termName}</h3>
          <p><strong>Total Fees:</strong> GHS {fees.totalFees}</p>
          <p><strong>Amount Paid:</strong> GHS {fees.amountPaid}</p>
          <p><strong>Balance:</strong> GHS {fees.balance}</p>
          <p><strong>Arrears:</strong> GHS {fees.arrears}</p>

          {fees.paymentHistory?.length > 0 && (
            <div className="payment-history">
              <strong>Payment History:</strong>
              <ul>
                {fees.paymentHistory.map((entry, i) => (
                  <li key={i}>
                    {moment(entry.date).format("MMM D, YYYY")} – GHS {entry.amount} ({entry.method})
                    {entry.note && <> – <em>{entry.note}</em></>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
