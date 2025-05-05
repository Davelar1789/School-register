import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Header from "../../../components/Teacher/TeacherHeader";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import { format } from "date-fns";
import toast from "react-hot-toast";
import "./Attendance.modules.css";

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [termRange, setTermRange] = useState({ start: null, end: null });
  const [isSchoolDay, setIsSchoolDay] = useState(false);

  const token = localStorage.getItem("token");

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

  const fetchStudents = async (classId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetched = res.data.students || [];
      setStudents(fetched);
      const initialAttendance = {};
      fetched.forEach((s) => {
        initialAttendance[s._id] = true;
      });
      setAttendanceData(initialAttendance);
      console.log("✅ Students fetched:", fetched);
    } catch (err) {
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  const fetchDateStatus = async (classId, date) => {
    try {
      const res = await axios.post(
        "/api/student/fetch-attendance",
        {
          classId,
          date: date.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const isSchool = res.data.isSchoolDay;
      setIsSchoolDay(isSchool);
  
      if (isSchool) {
        setAttendanceData({});
        const termStart = new Date(res.data.termStartDate);
        const termEnd = new Date(res.data.termEndDate);
        setTermRange({ start: termStart, end: termEnd });
  
      } else {
        console.log("⚠️ Not a school day:", date.toDateString());
      }
  
      return isSchool;
    } catch (err) {
      setIsSchoolDay(false);
      console.error("🚫 Error fetching date status:", err.response?.data?.message || err.message);
      return false;
    }
  };

  useEffect(() => {
    const runChecks = async () => {
      if (selectedClassId && currentDate) {
        const isValidSchoolDay = await fetchDateStatus(selectedClassId, currentDate);
        if (isValidSchoolDay) {
          await fetchStudents(selectedClassId);
        } else {
          setStudents([]); // Clear table if not a school day
        }
      }
    };
    runChecks();
  }, [selectedClassId, currentDate]);

  
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setIsSchoolDay(false);
    }
  }, [selectedClassId]);
  
  

  const handleSubmit = async () => {
    try {
      const payload = {
        classId: selectedClassId,
        attendance: Object.entries(attendanceData).map(([id, present]) => ({
          studentId: id,
          present,
        })),
      };
      await axios.post("/api/student/mark-attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Attendance submitted!");
    } catch (err) {
      toast.error("Failed to submit attendance");
    }
  };

  const handleCheckboxChange = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Load initial class list
  useEffect(() => {
    fetchClasses();
  }, []);

  // When class or date changes
  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
      fetchDateStatus(selectedClassId, currentDate);
    }
  }, [selectedClassId, currentDate]);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const disablePrev = termRange.start && currentDate <= termRange.start;
  const disableNext = termRange.end && currentDate >= termRange.end;

  return (
    <div>
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <div className="attendance-page">
          <h2>Teacher Attendance</h2>

          <div className="class-select">
            <label>Select Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setCurrentDate(new Date()); // reset to today on class change
              }}
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          <div className="date-nav">
            <button onClick={goToPreviousDay} disabled={disablePrev || !selectedClassId}>
              Previous
            </button>
            <span>{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
            <button onClick={goToNextDay} disabled={disableNext || !selectedClassId}>
              Next
            </button>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && !selectedClassId && (
            <p className="no-class">Please select a class</p>
            )}

            {!loading && selectedClassId && !isSchoolDay && (
            <p className="no-school">No school for today</p>
            )}


          {!loading && isSchoolDay && students.length > 0 && (
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
                          onChange={() => handleCheckboxChange(student._id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSubmit} className="submit-attendance-btn">
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
