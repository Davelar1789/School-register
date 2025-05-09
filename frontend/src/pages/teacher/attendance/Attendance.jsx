import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import "./Attendance.modules.css";

// Function to extract schoolId from token
const getSchoolIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    return decodedToken.schoolId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to check if a date is a weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday (0) & Saturday (6)
};

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [currentTerm, setCurrentTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [submittedDates, setSubmittedDates] = useState(new Set());

  const token = localStorage.getItem("token");
  const schoolId = getSchoolIdFromToken(); // Extract schoolId dynamically

  // Fetch the most recent term
  const fetchCurrentTerm = async () => {
    if (!schoolId) return console.error("Error: schoolId is undefined!");

    try {
      console.log("Fetching current term...");
      const { data } = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Term:", data);
      setCurrentTerm(data);
    } catch (error) {
      console.error("Error fetching current term:", error.response?.data || error.message);
      toast.error("Failed to fetch current term.");
    }
  };

  // Fetch teacher's classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students based on selected class
  const fetchStudents = async (classId) => {
    if (!classId) return;
    try {
      console.log("Fetching students for class ID:", classId);
      setLoading(true);

      const res = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched Students:", res.data);

      const studentData = Array.isArray(res.data) ? res.data : res.data.students || [];

      setStudents(studentData);
    } catch (err) {
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // Handle attendance selection
  const handleAttendanceChange = (studentId, present) => {
    setAttendance({ ...attendance, [studentId]: present });
  };

  // Validate and submit attendance
  const submitAttendance = async () => {
    if (!currentTerm) return toast.error("Term not found!");
    if (!selectedDate) return toast.error("Please select a date.");
    if (isWeekend(selectedDate)) return toast.error("Cannot mark attendance on weekends.");
    
    const attendanceDate = new Date(selectedDate);
    if (attendanceDate < new Date(currentTerm.startDate) || attendanceDate > new Date(currentTerm.endDate)) {
      return toast.error("Selected date is outside the term period.");
    }
  
    if (submittedDates.has(selectedDate)) {
      return toast.error("Attendance for this date is already recorded.");
    }
  
    // Prepare batch attendance list, defaulting unmarked students to absent
    const attendanceList = students.map(student => ({
      studentId: student._id,
      present: attendance[student._id] || false, // Default to false if not marked
    }));
  
    try {
      await axios.post("/api/attendance/mark-batch", {
        termId: currentTerm._id,
        date: selectedDate,
        attendanceList,
      }, { headers: { Authorization: `Bearer ${token}` } });
  
      setSubmittedDates((prev) => new Set(prev).add(selectedDate));
      toast.success("Attendance marked successfully!");
    } catch (err) {
      toast.error("Error marking attendance.");
    }
  };

  // Fetch everything on component mount
  useEffect(() => {
    fetchCurrentTerm();
    fetchClasses();
  }, []);

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Mark Attendance</h2>

      {/* Class Selector */}
      <select className="class-selector" onChange={(e) => {
        setSelectedClass(e.target.value);
        fetchStudents(e.target.value);
      }}>
        <option value="">Select Class</option>
        {classes.map((cls) => (
          <option key={cls._id} value={cls._id}>{cls.className}</option>
        ))}
      </select>

      {/* Date Selector */}
      <input 
        type="date" 
        className="date-selector"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={currentTerm?.startDate?.slice(0, 10)}
        max={currentTerm?.endDate?.slice(0, 10)}
      />

      {/* Students List */}
      {loading ? (
        <p className="loading-message">Loading students...</p>
      ) : students.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>ID No</th>
              <th>Present?</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="student-row">
                <td className="student-name">{student.name}</td>
                <td className="student-id">{student.idno}</td>
                <td className="attendance-checkbox">
                  <input
                    type="checkbox"
                    checked={attendance[student._id] || false}
                    onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-students-message">No students found for this class.</p>
      )}

      <button className="submit-button" onClick={submitAttendance} disabled={!selectedClass || !students.length}>
        Submit Attendance
      </button>
    </div>
  );
};

export default Attendance;