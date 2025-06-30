import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";
import "./StudentDetails.modules.css";
import Header2 from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { LinearProgress, Modal, Box, TextField, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [dobOpen, setDobOpen] = useState(false);
  const [selectedDOB, setSelectedDOB] = useState(null);

  const [modalField, setModalField] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStudent = async () => {
    try {
      const res = await axios.get(`/api/student/free/${id}`);
      setStudent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 100);

    fetchStudent().finally(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    });
  }, [id]);

  const handleEditDOB = async (newDOB) => {
    try {
      const formattedDate = dayjs(newDOB).format("YYYY-MM-DD");
      await axios.patch(`/api/student/${id}`, { dob: formattedDate });
      await fetchStudent();
    } catch (error) {
      console.error("Failed to update DOB:", error);
    }
    setDobOpen(false);
  };

  const openFieldModal = (field) => {
    setModalField(field);
    setModalValue(student[field] || "");
    setModalOpen(true);
  };

  const handleModalSave = async () => {
    try {
      await axios.patch(`/api/student/${id}`, { [modalField]: modalValue });
      await fetchStudent();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to update field:", error);
    }
  };

  const latestAcademic = student?.academicRecords?.[student.academicRecords.length - 1];
  const latestTerm = latestAcademic?.terms?.[latestAcademic.terms.length - 1];
  const fees = latestTerm?.fees;

  return (
    <div>
      <Header2 />
      <Sidebar />
      <div className="student-page">
        {isLoading ? (
          <div className="loading-wrapper">
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
          </div>
        ) : (
          <>
            <h1 className="student-heading">Student Details</h1>

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
                <span className="summary-value">
                  {student.dob}
                  <IconButton onClick={() => setDobOpen(true)} size="small">
                    <EditIcon sx={{ color: "white", ml: 1 }} />
                  </IconButton>
                </span>
              </div>
            </div>

            <div className="details-section">
              <h2>Contact Information</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Phone:</strong>
                  <span>
                    {student.phone || "N/A"}
                    <IconButton onClick={() => openFieldModal("phone")} size="small">
                      <EditIcon sx={{ color: "white", ml: 1 }} />
                    </IconButton>
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Address:</strong>
                  <span>
                    {student.address || "N/A"}
                    <IconButton onClick={() => openFieldModal("address")} size="small">
                      <EditIcon sx={{ color: "white", ml: 1 }} />
                    </IconButton>
                  </span>
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

            {/* 🎯 Date Picker Modal */}
            <Modal open={dobOpen} onClose={() => setDobOpen(false)}>
              <Box className="modal-box">
                <DatePicker
                  label="Select New Date of Birth"
                  value={selectedDOB || dayjs(student.dob)}
                  onChange={(val) => setSelectedDOB(val)}
                />
                <button onClick={() => handleEditDOB(selectedDOB)}>Save</button>
              </Box>
            </Modal>

            {/* ✏️ Field Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <Box className="modal-box">
                <TextField
                  label={`Edit ${modalField}`}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  fullWidth
                />
                <button onClick={handleModalSave}>Save</button>
              </Box>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;