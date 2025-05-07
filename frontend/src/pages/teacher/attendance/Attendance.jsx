import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Header from "../../../components/Teacher/TeacherHeader";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import toast from "react-hot-toast";
import { startOfWeek, addDays, format } from "date-fns";
import "./Attendance.modules.css";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [attendanceData, setAttendanceData] = useState({});
  const [termRange, setTermRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

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

  const fetchAttendanceForWeek = async (classId, startDate) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/student/fetch-week-attendance",
        { classId, weekStartDate: startDate.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const students = res.data.students || [];
      const weekAttendance = res.data.attendanceForWeek || {};

      const attendanceMap = {};
      students.forEach((s) => {
        attendanceMap[s._id] = {};
        weekdays.forEach((day) => {
          attendanceMap[s._id][day] = weekAttendance[s._id]?.[day] || "not_marked";
        });
      });

      setStudents(students);
      setAttendanceData(attendanceMap);
      setTermRange({
        start: new Date(res.data.termStartDate),
        end: new Date(res.data.termEndDate),
      });
    } catch (err) {
      toast.error("Failed to fetch weekly attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (studentId, day) => {
    setAttendanceData((prev) => {
      const current = prev[studentId][day];
      if (current === "not_marked") {
        return {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [day]: "present",
          },
        };
      } else if (current === "present") {
        return {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [day]: "absent",
          },
        };
      } else {
        return {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [day]: "not_marked",
          },
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        classId: selectedClassId,
        weekStartDate,
        attendance: Object.entries(attendanceData).map(([studentId, days]) => ({
          studentId,
          days,
        })),
      };

      await axios.post("/api/student/mark-week-attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Weekly attendance submitted!");
    } catch (err) {
      toast.error("Failed to submit attendance");
    }
  };

  const goToPrevWeek = () => {
    setWeekStartDate((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setWeekStartDate((prev) => addDays(prev, 7));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendanceForWeek(selectedClassId, weekStartDate);
    }
  }, [selectedClassId, weekStartDate]);

  const disablePrev = termRange.start && weekStartDate <= termRange.start;
  const disableNext =
    termRange.end && addDays(weekStartDate, 4) >= termRange.end;

  return (
    <div>
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <div className="attendance-page">
          <h2>Weekly Attendance</h2>

          <div className="class-select">
            <label>Select Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
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
            <button onClick={goToPrevWeek} disabled={disablePrev}>
              Previous Week
            </button>
            <span className="date-col">
              Week of {format(weekStartDate, "MMMM d, yyyy")}
            </span>
            <button onClick={goToNextWeek} disabled={disableNext}>
              Next Week
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {!loading && students.length > 0 && (
            <div className="attendance-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    {weekdays.map((day) => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      {weekdays.map((day) => (
                        <td key={day}>
                          <input
                            type="checkbox"
                            checked={attendanceData[student._id]?.[day] === "present"}
                            onChange={() =>
                              handleCheckboxChange(student._id, day)
                            }
                            disabled={
                              attendanceData[student._id]?.[day] !== "not_marked"
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSubmit} className="submit-attendance-btn">
                Submit Weekly Attendance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;


 