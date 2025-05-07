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
  const [isTodayMarked, setIsTodayMarked] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [termRange, setTermRange] = useState({ start: null, end: null });
  const [isSchoolDay, setIsSchoolDay] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all teacher's assigned classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/teachers/teacher/teacher-classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data.classes || []);
      } catch {
        toast.error("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [token]);

  // Unified effect: fetch students and attendance data on class/date change
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!selectedClassId) {
        setStudents([]);
        setAttendanceData({});
        setIsSchoolDay(false);
        return;
      }

      try {
        setLoading(true);
        setAttendanceData({});
        setIsTodayMarked(false);

        // Fetch students
        const studentRes = await axios.get(`/api/student/class/${selectedClassId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedStudents = Array.isArray(studentRes.data)
          ? studentRes.data
          : studentRes.data.students || [];
        setStudents(fetchedStudents);

        // Fetch attendance
        const attendanceRes = await axios.post(
          "/api/student/fetch-attendance",
          {
            classId: selectedClassId,
            date: currentDate.toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const isSchool = attendanceRes.data.isSchoolDay;
        setIsSchoolDay(isSchool);

        if (isSchool) {
          const termStart = new Date(attendanceRes.data.termStartDate);
          const termEnd = new Date(attendanceRes.data.termEndDate);
          setTermRange({ start: termStart, end: termEnd });

          const attendanceForDay = attendanceRes.data.attendanceForDay || {};
          const fullAttendance = {};

          fetchedStudents.forEach((student) => {
            fullAttendance[student._id] = attendanceForDay[student._id] || "not_marked";
          });

          setAttendanceData(fullAttendance);

          const allMarked = Object.values(fullAttendance).every(
            (status) => status === "present" || status === "absent"
          );
          setIsTodayMarked(allMarked);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        toast.error("Failed to load attendance data");
        setStudents([]);
        setIsSchoolDay(false);
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, [selectedClassId, currentDate, token]);

  // Submit attendance
  const handleSubmit = async () => {
    try {
      const payload = {
        classId: selectedClassId,
        attendance: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId,
          present: status === "present",
        })),
      };

      await axios.post("/api/student/mark-attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Attendance submitted!");
      setIsTodayMarked(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit attendance");
    }
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (studentId) => {
    setAttendanceData((prev) => {
      const current = prev[studentId];
      const newStatus = current === "present" ? "absent" : "present";
      return { ...prev, [studentId]: newStatus };
    });
  };

  // Navigate dates
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
                setCurrentDate(new Date());
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
            <span className="date-col">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
            <button onClick={goToNextDay} disabled={disableNext || !selectedClassId}>
              Next
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {!loading && !selectedClassId && <p className="no-class">Please select a class</p>}
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
                          checked={attendanceData[student._id] === "present"}
                          onChange={() => handleCheckboxChange(student._id)}
                          disabled={isTodayMarked}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isTodayMarked ? (
                <div className="attendance-submitted-msg">
                  Attendance already submitted ✅
                </div>
              ) : (
                <button onClick={handleSubmit} className="submit-attendance-btn">
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
