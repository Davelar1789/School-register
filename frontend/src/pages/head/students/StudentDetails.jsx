import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";
import "./StudentDetails.modules.css";
import Header2 from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { LinearProgress } from "@mui/material"; // For the loading bar

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 100);

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/student/free/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        clearInterval(interval);
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 500); // small delay
      }
    };

    fetchStudent();
  }, [id]);

  const latestAcademic = student?.academicRecords?.[student.academicRecords.length - 1];
  const latestTerm = latestAcademic?.terms?.[latestAcademic.terms.length - 1];
  const fees = latestTerm?.fees;

 return (
    <div>
      <Header2 />
      <Sidebar />
      <div className="student-page">
        {isLoading ? (
          <div className="loading-box">
            <p>Loading student details...</p>
            <LinearProgress
              variant="determinate"
              value={loadingProgress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "limegreen",
                },
              }}
            />
          </div>
        ) : (
          <>
            <h1 className="student-heading">Student Dashboard</h1>

            <div className="summary-grid">
              <div className="summary-box">
                <span className="summary-title">Full Name</span>
                <span className="summary-value">{student.name}</span>
              </div>
              <div className="summary-box">
                <span className="summary-title">Class</span>
                <span className="summary-value">
                  {student.classes?.[0]?.className || "N/A"}
                </span>
              </div>
              <div className="summary-box">
                <span className="summary-title">ID Number</span>
                <span className="summary-value">{student.idno}</span>
              </div>
              <div className="summary-box">
                <span className="summary-title">Date of Birth</span>
                <span className="summary-value">{student.dob}</span>
              </div>
            </div>

            <div className="details-section">
              <h2>Contact Information</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Phone:</strong> <span>{student.phone || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <strong>Address:</strong> <span>{student.address || "N/A"}</span>
                </div>
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
                    <span className="value value2">₵{fees.balance}</span>
                  </div>
                </>
              ) : (
                <p className="no-fees">No fees info available for this term.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;