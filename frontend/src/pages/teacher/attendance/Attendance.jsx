import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { FaUserCheck, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Attendance.modules.css";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://school-register-a2bx.onrender.com/api/teachers/teacher/teacher-classes",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://school-register-a2bx.onrender.com/api/student/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedStudents = res.data.students || res.data || []; // <-- fallback logic
        setStudents(fetchedStudents);
        // build attendance state
        const defaultAttendance = {};
        fetchedStudents.forEach((student) => {
        defaultAttendance[student._id] = true;
        });
        setAttendanceData(defaultAttendance);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        classId: selectedClassId,
        attendance: Object.entries(attendanceData).map(([studentId, present]) => ({
          studentId,
          present,
        })),
      };
      await axios.post(
        `/api/student/mark-attendance`,
        payload,
        {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Attendance submitted successfully!");
    } catch (err) {
      console.error("Failed to submit attendance:", err);
      alert("Failed to submit attendance");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div>
        <Header />
        <div>
            <Sidebar />
      
    <div className="attendance-page">
      <h2>Attendance Page</h2>

      <div className="class-select">
        <label>Select Class:</label>
        <select
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            fetchStudents(e.target.value);
          }}
        >
          <option value="">-- Choose a class --</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && students.length > 0 && (
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={attendanceData[student._id] || false}
                      onChange={() => handleAttendanceChange(student._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="submit-attendance-btn" onClick={handleSubmit}>
            Submit Attendance
          </button>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default Attendance;
