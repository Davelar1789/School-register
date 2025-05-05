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
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch classes assigned to teacher
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students in the selected class
  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedStudents = res.data.students || res.data || [];
      setStudents(fetchedStudents);

      // Initialize attendance as true for all unless overridden below
      const defaultAttendance = {};
      fetchedStudents.forEach((student) => {
        defaultAttendance[student._id] = true;
      });

      // Then check if there's already attendance for this class and date
      const attendanceRes = await axios.post(
        "/api/student/fetch-attendance",
        {
          classId,
          date: currentDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const existing = attendanceRes.data.attendance || [];

      existing.forEach((record) => {
        defaultAttendance[record.studentId] = record.present;
      });

      setAttendanceData(defaultAttendance);
    } catch (err) {
      console.error("Error fetching students or attendance:", err);
      toast.error("Failed to fetch students or attendance");
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox toggle
  const handleAttendanceChange = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Submit attendance
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        classId: selectedClassId,
        date: currentDate,
        attendance: Object.entries(attendanceData).map(
          ([studentId, present]) => ({
            studentId,
            present,
          })
        ),
      };

      await axios.post("/api/student/mark-attendance", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Attendance submitted successfully!");
      fetchStudents(selectedClassId); // Refresh state after marking
    } catch (err) {
      console.error("Failed to submit attendance:", err);
      toast.error("Failed to submit attendance");
    }
  };

  // Prevent moving into future days
  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const input = new Date(date);
    input.setHours(0, 0, 0, 0);
    return input > today;
  };

  const changeDate = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + direction);
      return newDate;
    });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, currentDate]);

  return (
    <div>
      <Header />
      <div>
        <Sidebar />

        <div className="attendance-page">
          <h2>
            <FaUserCheck /> Attendance Page
          </h2>

          <div className="class-select">
            <label>Select Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
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

          <div className="date-navigation">
            <button onClick={() => changeDate(-1)}>← Previous</button>
            <span>
              <FaCalendarAlt /> {currentDate.toDateString()}
            </span>
            <button onClick={() => changeDate(1)} disabled={isFutureDate(new Date(currentDate.getTime() + 86400000))}>
              Next →
            </button>
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
                          disabled={isFutureDate(currentDate)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isFutureDate(currentDate) && (
                <button className="submit-attendance-btn" onClick={handleSubmit}>
                  Submit Attendance
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
