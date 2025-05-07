// Same imports...
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

  const fetchClasses = async () => {
    try {
      console.log("Fetching teacher classes...");
      setLoading(true);
      const res = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Classes fetched:", res.data.classes);
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      console.log("Fetching students for class:", classId);
      setLoading(true);
      const res = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Raw students response:", res.data);
      const fetched = Array.isArray(res.data) ? res.data : res.data.students || [];
      console.log("Students fetched:", fetched);
      setStudents(fetched);

      const initialAttendance = {};
      fetched.forEach((s) => {
        initialAttendance[s._id] = "not_marked";
      });
      console.log("Initial attendance data set:", initialAttendance);
      setAttendanceData(initialAttendance);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  const fetchDateStatus = async (classId, date) => {
    try {
      console.log(`Checking school day status for ${date.toISOString()}...`);
      const res = await axios.post(
        "/api/student/fetch-attendance",
        { classId, date: date.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Date status response:", res.data);

      const isSchool = res.data.isSchoolDay;
      setIsSchoolDay(isSchool);

      if (isSchool) {
        const termStart = new Date(res.data.termStartDate);
        const termEnd = new Date(res.data.termEndDate);
        console.log("Term range:", { termStart, termEnd });
        setTermRange({ start: termStart, end: termEnd });

        const attendanceForDay = res.data.attendanceForDay || {};
        console.log("Attendance for day:", attendanceForDay);

        const fullAttendance = {};
        students.forEach((s) => {
          fullAttendance[s._id] = attendanceForDay[s._id] || "not_marked";
        });

        console.log("Full attendance prepared:", fullAttendance);
        setAttendanceData(fullAttendance);

        const allMarked = Object.values(fullAttendance).every(
          (status) => status === "present" || status === "absent"
        );
        console.log("Is today's attendance fully marked?", allMarked);
        setIsTodayMarked(allMarked);
      }

      return isSchool;
    } catch (err) {
      console.error("Error checking date status:", err);
      setIsSchoolDay(false);
      return false;
    }
  };

  useEffect(() => {
    if (!selectedClassId) {
      console.log("No class selected, resetting student list and school day status.");
      setStudents([]);
      setIsSchoolDay(false);
      return;
    }

    const runChecks = async () => {
      console.log("Running checks for class:", selectedClassId, "on date:", currentDate);
      const isValid = await fetchDateStatus(selectedClassId, currentDate);
      if (isValid) {
        await fetchStudents(selectedClassId);
      } else {
        console.log("Invalid school day, clearing student list.");
        setStudents([]);
      }
    };

    runChecks();
  }, [selectedClassId, currentDate]);

  const handleSubmit = async () => {
    try {
      const payload = {
        classId: selectedClassId,
        attendance: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId,
          present: status === "present",
        })),
      };
      console.log("Submitting attendance payload:", payload);

      await axios.post("/api/student/mark-attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Attendance submitted!");
      setIsTodayMarked(true);
    } catch (err) {
      console.error("Error submitting attendance:", err);
      toast.error(err.response?.data?.message || "Failed to submit attendance");
    }
  };

  const handleCheckboxChange = (studentId) => {
    setAttendanceData((prev) => {
      const current = prev[studentId];
      const newStatus = current === "present" ? "absent" : "present";
      console.log(`Changing status for ${studentId} from ${current} to ${newStatus}`);
      return { ...prev, [studentId]: newStatus };
    });
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

  useEffect(() => {
    fetchClasses();
  }, []);

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
            {/* <button onClick={goToPreviousDay} disabled={disablePrev || !selectedClassId}>
              Previous
            </button> */}
            <span className="date-col">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
            {/* <button onClick={goToNextDay} disabled={disableNext || !selectedClassId}>
              Next
            </button> */}
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
