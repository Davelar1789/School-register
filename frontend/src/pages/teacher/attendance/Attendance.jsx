import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";

// Function to extract schoolId from the token
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

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendance, setAttendance] = useState({});
  const [currentTerm, setCurrentTerm] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const schoolId = getSchoolIdFromToken(); // ✅ Extract schoolId dynamically

  // Fetch the most recent term
  const fetchCurrentTerm = async () => {
    if (!schoolId) return console.error("Error: schoolId is undefined!");

    try {
      console.log("Fetching current term for school:", schoolId);
      const { data } = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Current term fetched successfully:", data);
      setCurrentTerm(data);
    } catch (error) {
      console.error("Error fetching current term:", error.response?.data || error.message);
      toast.error("Failed to fetch current term.");
    }
  };

  // Fetch teacher's classes dynamically
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
      setLoading(true);
      const res = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  // Handle attendance selection
  const handleAttendanceChange = (studentId, present) => {
    setAttendance({ ...attendance, [studentId]: present });
  };

  // Submit attendance to the API
  const submitAttendance = async () => {
    if (!currentTerm) return toast.error("Term not found!");
    try {
      await Promise.all(
        Object.entries(attendance).map(([studentId, present]) =>
          axios.post("/api/attendance/mark", {
            studentId,
            termId: currentTerm._id,
            date: new Date(),
            present,
          }, { headers: { Authorization: `Bearer ${token}` } })
        )
      );
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

      {/* Students List */}
      {students.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Present?</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="student-row">
                <td className="student-name">{student.name}</td>
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