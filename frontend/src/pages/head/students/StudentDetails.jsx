import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import "./StudentDetails.modules.css";
import Header2 from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar
} from "@mui/material";
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Calendar as CalendarIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [classOpen, setClassOpen] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const [selectedDOB, setSelectedDOB] = useState(null);
  const [modalField, setModalField] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");

  const token = localStorage.getItem("token");
  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;

  const formatGender = (gender) =>
    gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : "N/A";

  const fetchStudent = async () => {
    const res = await axios.get(`/api/student/free/${id}`);
    setStudent(res.data);
    if (res.data.classes?.length > 0) {
      setSelectedClassId(res.data.classes[0]._id);
    }
    return res.data;
  };

  useEffect(() => {
    if (student?.gender) {
      setSelectedGender(student.gender);
    }
  }, [student]);

  const fetchClasses = async () => {
    if (!schoolId) return;
    const res = await axios.get(`/api/classes/school/${schoolId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAvailableClasses(res.data);
    return res.data;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchStudent(), fetchClasses()]);
        setLoadingProgress(100);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load student data");
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleGenderEdit = async () => {
    try {
      await axios.patch(
        `/api/student/${student._id}/update-gender`,
        { gender: selectedGender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Gender updated successfully");
      await fetchStudent();
      setGenderOpen(false);
    } catch (err) {
      console.error("Error updating gender:", err);
      toast.error("Failed to update gender");
    }
  };

  const handleEditDOB = async (newDOB) => {
    try {
      const formattedDate = dayjs(newDOB).format("YYYY-MM-DD");
      await axios.patch(`/api/student/${id}`, { dob: formattedDate });
      toast.success("Date of birth updated successfully");
      await fetchStudent();
      setDobOpen(false);
    } catch (error) {
      console.error("Failed to update DOB:", error);
      toast.error("Failed to update date of birth");
    }
  };

  const openFieldModal = (field) => {
    setModalField(field);
    setModalValue(student[field] || "");
    setModalOpen(true);
  };

  const handleClassEdit = async () => {
    if (!selectedClassId) return toast.error("Please select a class.");
    try {
      await axios.put(
        `/api/student/${student._id}/update-class`,
        { classId: selectedClassId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Class updated successfully");
      await fetchStudent();
      setClassOpen(false);
    } catch (err) {
      console.error("Error updating class:", err);
      toast.error("Failed to update class");
    }
  };

  const handleModalSave = async () => {
    try {
      await axios.patch(`/api/student/${id}`, { [modalField]: modalValue });
      toast.success(`${modalField} updated successfully`);
      await fetchStudent();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to update field:", error);
      toast.error(`Failed to update ${modalField}`);
    }
  };

  const latestAcademic = student?.academicRecords?.[student.academicRecords.length - 1];
  const latestTerm = latestAcademic?.terms?.[latestAcademic.terms.length - 1];
  const fees = latestTerm?.fees;

  // Get student initials for avatar
  const getInitials = (name) => {
    if (!name) return "S";
    const parts = name.split(" ");
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div>
      <Header2 />
      <Sidebar />
      <div className="student-page">
        {isLoading ? (
          <div className="loading-wrapper">
            <Card className="loading-card">
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  Loading student details...
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={loadingProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mt: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#4a90e2",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Header with Back Button */}
            <div className="page-header">
              <IconButton 
                onClick={() => navigate(-1)} 
                className="back-button"
                sx={{ color: "#fff" }}
              >
                <ArrowBackIcon />
              </IconButton>
              <h1 className="student-heading">Student Profile</h1>
            </div>

            {/* Student Header Card */}
            <Card className="student-header-card">
              <CardContent>
                <div className="student-header-content">
                  <Avatar 
                    className="student-avatar"
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      fontSize: "2rem",
                      background: "linear-gradient(135deg, #4a90e2, #ff8c00)"
                    }}
                  >
                    {getInitials(student?.name)}
                  </Avatar>
                  <div className="student-header-info">
                    <div className="name-section">
                      <Typography variant="h4" className="student-name">
                        {student?.name}
                      </Typography>
                      <IconButton 
                        onClick={() => openFieldModal("name")} 
                        size="small"
                        sx={{ color: "#4a90e2" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                    <div className="student-meta">
                      <Chip 
                        label={student?.classes?.[0]?.className || "No Class"} 
                        color="primary" 
                        size="small"
                        icon={<SchoolIcon />}
                      />
                      <Chip 
                        label={formatGender(student?.gender)} 
                        variant="outlined" 
                        size="small"
                        icon={<PersonIcon />}
                      />
                      <Chip 
                        label={`ID: ${student?.idno || "N/A"}`} 
                        variant="outlined" 
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Info Grid */}
            <div className="info-section">
              <Typography variant="h6" className="section-title">
                Personal Information
              </Typography>
              <div className="info-grid">
                <Card className="info-card">
                  <CardContent>
                    <div className="info-card-header">
                      <SchoolIcon className="info-icon" />
                      <Typography variant="subtitle2" color="textSecondary">
                        Class
                      </Typography>
                    </div>
                    <div className="info-card-content">
                      <Typography variant="h6">
                        {student?.classes?.[0]?.className || "N/A"}
                      </Typography>
                      <IconButton 
                        onClick={() => setClassOpen(true)} 
                        size="small"
                        className="edit-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>

                <Card className="info-card">
                  <CardContent>
                    <div className="info-card-header">
                      <PersonIcon className="info-icon" />
                      <Typography variant="subtitle2" color="textSecondary">
                        Gender
                      </Typography>
                    </div>
                    <div className="info-card-content">
                      <Typography variant="h6">
                        {formatGender(student?.gender)}
                      </Typography>
                      <IconButton 
                        onClick={() => setGenderOpen(true)} 
                        size="small"
                        className="edit-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>

                <Card className="info-card">
                  <CardContent>
                    <div className="info-card-header">
                      <CalendarIcon className="info-icon" />
                      <Typography variant="subtitle2" color="textSecondary">
                        Date of Birth
                      </Typography>
                    </div>
                    <div className="info-card-content">
                      <Typography variant="h6">
                        {student?.dob || "N/A"}
                      </Typography>
                      <IconButton 
                        onClick={() => setDobOpen(true)} 
                        size="small"
                        className="edit-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Information */}
            <div className="info-section">
              <Typography variant="h6" className="section-title">
                Contact Information
              </Typography>
              <div className="contact-grid">
                <Card className="info-card">
                  <CardContent>
                    <div className="info-card-header">
                      <PhoneIcon className="info-icon" />
                      <Typography variant="subtitle2" color="textSecondary">
                        Phone Number
                      </Typography>
                    </div>
                    <div className="info-card-content">
                      <Typography variant="h6">
                        {student?.phone || "Not provided"}
                      </Typography>
                      <IconButton 
                        onClick={() => openFieldModal("phone")} 
                        size="small"
                        className="edit-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>

                <Card className="info-card">
                  <CardContent>
                    <div className="info-card-header">
                      <HomeIcon className="info-icon" />
                      <Typography variant="subtitle2" color="textSecondary">
                        Address
                      </Typography>
                    </div>
                    <div className="info-card-content">
                      <Typography variant="h6">
                        {student?.address || "Not provided"}
                      </Typography>
                      <IconButton 
                        onClick={() => openFieldModal("address")} 
                        size="small"
                        className="edit-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Fees Information */}
            <div className="info-section">
              <Typography variant="h6" className="section-title">
                <MoneyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Fee Information
              </Typography>
              {fees ? (
                <Card className="fees-card">
                  <CardContent>
                    <div className="fees-grid">
                      <div className="fee-item">
                        <Typography variant="subtitle2" color="textSecondary">
                          Total Fees
                        </Typography>
                        <Typography variant="h5" className="fee-value">
                          ₵{fees.totalFees?.toLocaleString()}
                        </Typography>
                      </div>
                      <div className="fee-item">
                        <Typography variant="subtitle2" color="textSecondary">
                          Amount Paid
                        </Typography>
                        <Typography variant="h5" className="fee-value paid">
                          ₵{fees.amountPaid?.toLocaleString()}
                        </Typography>
                      </div>
                      <div className="fee-item">
                        <Typography variant="subtitle2" color="textSecondary">
                          Arrears
                        </Typography>
                        <Typography variant="h5" className="fee-value arrears">
                          ₵{fees.arrears?.toLocaleString()}
                        </Typography>
                      </div>
                      <div className="fee-item highlight">
                        <Typography variant="subtitle2" color="textSecondary">
                          Balance
                        </Typography>
                        <Typography variant="h5" className="fee-value balance">
                          ₵{fees.balance?.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="no-data-card">
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" align="center">
                      No fee information available for this term
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modals */}
            <Dialog open={dobOpen} onClose={() => setDobOpen(false)}>
              <DialogTitle>Edit Date of Birth</DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                <DatePicker
                  label="Select Date of Birth"
                  value={selectedDOB || dayjs(student?.dob)}
                  onChange={(val) => setSelectedDOB(val)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDobOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => handleEditDOB(selectedDOB)}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={classOpen} onClose={() => setClassOpen(false)}>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    label="Select Class"
                  >
                    {availableClasses.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.className}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setClassOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleClassEdit}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
              <DialogTitle>Edit {modalField}</DialogTitle>
              <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                <TextField
                  label={modalField}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  fullWidth
                  autoFocus
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleModalSave}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={genderOpen} onClose={() => setGenderOpen(false)}>
              <DialogTitle>Edit Gender</DialogTitle>
              <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setGenderOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleGenderEdit}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;