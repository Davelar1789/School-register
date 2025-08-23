import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import Header from "../../../components/Teacher/TeacherHeader";
import "./Attendance.modules.css";

// Function to extract schoolId from token
const getDataFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    return {
      teacherId: decodedToken?.id || null,
      teacherEmail: decodedToken?.email || null,
      schoolId: decodedToken?.schoolId || null, // ✅ Added schoolId extraction back
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to check if a date is a weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // ✅ Simplified with clearer readability
};

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [currentTerm, setCurrentTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [submittedDates, setSubmittedDates] = useState(new Set());
  const [existingAttendance, setExistingAttendance] = useState({}); // ✅ Store previously submitted attendance
const [attendanceIds, setAttendanceIds] = useState({}); // ✅ Map of studentId to attendance record _id
const [isEditing, setIsEditing] = useState(false); // ✅ Track editing mode
const [offlineMode, setOfflineMode] = useState(true);

// Function to check connectivity via /ping
const checkOnlineStatus = async () => {
  try {
    await axios.get("/ping"); // your backend ping endpoint
    setOfflineMode(false); // reachable → online
  } catch (err) {
    setOfflineMode(true); // unreachable → offline
  }
};

// Check only on mount
useEffect(() => {
  checkOnlineStatus();
}, []);


  const token = localStorage.getItem("token");
  const schoolId = getDataFromToken(); // ✅ Ensuring correct extraction


   // ✅ Open confirmation modal
   const handleSubmitClick = () => {
    setShowModal(true);
  };

  // ✅ Close modal without submitting
  const handleCancel = () => {
    setShowModal(false);
  };

// Fetch the most recent term (offline: try cached term first)
const fetchCurrentTerm = async () => {
  if (!schoolId) return;

  if (offlineMode) {
    const cachedTerm = JSON.parse(localStorage.getItem("offlineCurrentTerm"));
    if (cachedTerm) {
      setCurrentTerm(cachedTerm);
      toast.success("Offline: Loaded cached term.");
    } else {
      toast.error("Offline: No cached term available.");
    }
    return;
  }

  try {
    const { data } = await axios.get(`/api/terms/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCurrentTerm(data);
    // Cache for offline usage
    localStorage.setItem("offlineCurrentTerm", JSON.stringify(data));
  } catch (error) {
    console.error("Error fetching current term:", error);
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
    // Cache for offline
    localStorage.setItem("offlineClasses", JSON.stringify(res.data.classes || []));
  } catch (err) {
    console.error("Error fetching classes:", err);
    if (offlineMode) {
      const cachedClasses = JSON.parse(localStorage.getItem("offlineClasses")) || [];
      setClasses(cachedClasses);
      toast.success("Offline: Loaded cached classes.");
    } else {
      toast.error("Failed to load classes.");
    }
  } finally {
    setLoading(false);
  }
};

const fetchStudents = async (classId) => {
  if (!classId) return;
  try {
    setLoading(true);
    if (!offlineMode) {
      const res = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentData = Array.isArray(res.data) ? res.data : res.data.students || [];
      setStudents(studentData);
      // Cache for offline
      localStorage.setItem(`offlineStudents_${classId}`, JSON.stringify(studentData));
    } else {
      // Offline branch
      const cachedStudents = JSON.parse(localStorage.getItem(`offlineStudents_${classId}`)) || [];
      setStudents(cachedStudents);
      if (cachedStudents.length > 0) {
        toast.success("Offline: Loaded cached students.");
      } else {
        console.log("Offline: No cached students found."); // safer than toast.info
      }
    }
  } catch (err) {
    console.error("Error loading students:", err);
    if (!offlineMode) toast.error("Failed to load students.");
  } finally {
    setLoading(false);
  }
};


// Fetch attendance for a given date (offline: load cached attendance)
const fetchAttendanceForDate = async (classId, date) => {
  if (!classId || !date || !currentTerm) return;

  if (offlineMode) {
    const key = `offlineAttendance_${classId}_${date}`;
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached) {
      const offlineMap = {};
      cached.forEach((rec) => {
        offlineMap[rec.studentId] = rec.present;
      });
      setAttendance(offlineMap);
      setExistingAttendance(offlineMap);
      setSubmittedDates((prev) => new Set(prev).add(`${classId}_${date}`));
      toast.success("Offline: Loaded cached attendance for this date.");
    } else {
      toast.info("Offline: No cached attendance for this date.");
      setAttendance({});
      setExistingAttendance({});
    }
    return;
  }

  try {
    const res = await axios.get(`/api/attendance/fetch`, {
      params: { termId: currentTerm._id, classId, date },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.length > 0) {
      setSubmittedDates((prev) => new Set(prev).add(`${classId}_${date}`));

      const attendanceMap = {};
      const idMap = {};
      res.data.forEach((record) => {
        attendanceMap[record.studentId._id] = record.present;
        idMap[record.studentId._id] = record._id;
      });

      setAttendance(attendanceMap);
      setExistingAttendance(attendanceMap);
      setAttendanceIds(idMap);
    }
  } catch (err) {
    console.error("Error checking attendance records:", err);
  }
};

// Submit updated attendance (offline: save to localStorage)
const updateAttendance = async () => {
  setShowModal(false);
  const teacherData = getDataFromToken();
  if (!teacherData) return toast.error("Invalid token or teacher data missing!");

  if (offlineMode) {
    const key = `offlineAttendance_${selectedClass}_${selectedDate}`;
    const attendanceList = students.map((student) => ({
      studentId: student._id,
      present: attendance[student._id] || false,
    }));
    localStorage.setItem(key, JSON.stringify(attendanceList));
    setSubmittedDates((prev) => new Set(prev).add(`${selectedClass}_${selectedDate}`));
    toast.success("Offline: Attendance saved locally. Will sync when online.");
    setIsEditing(false);
    return;
  }

  try {
    const updates = [];
    students.forEach((student) => {
      const id = student._id;
      const present = attendance[id];
      const original = existingAttendance[id];

      if (present !== original) {
        const attendanceId = attendanceIds[id];
        if (attendanceId) {
          updates.push(
            axios.put(
              `/api/attendance/update/${attendanceId}`,
              { present },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
        }
      }
    });

    await Promise.all(updates);
    toast.success("Attendance updated successfully!");
    setIsEditing(false);
  } catch (err) {
    console.error("Error updating attendance:", err);
    toast.error("Failed to update attendance.");
  }
};

// Handle attendance selection
const handleAttendanceChange = (studentId, present) => {
  setAttendance((prev) => ({ ...prev, [studentId]: present }));
};

// Submit new attendance (offline: save locally)
const submitAttendance = async () => {
  setShowModal(false);

  if (!currentTerm) return toast.error("Term not found!");
  if (!selectedDate) return toast.error("Please select a date.");
  if (isWeekend(selectedDate)) return toast.error("Cannot mark attendance on weekends.");
  if (submittedDates.has(`${selectedClass}_${selectedDate}`)) {
    return toast.error("Attendance for this class on this date is already recorded.");
  }

  const teacherData = getDataFromToken();
  if (!teacherData) return toast.error("Invalid token or teacher data missing!");

  const attendanceList = students.map((student) => ({
    studentId: student._id,
    present: attendance[student._id] || false,
  }));

  if (offlineMode) {
    const key = `offlineAttendance_${selectedClass}_${selectedDate}`;
    localStorage.setItem(key, JSON.stringify(attendanceList));
    setSubmittedDates((prev) => new Set(prev).add(`${selectedClass}_${selectedDate}`));
    toast.success("Offline: Attendance saved locally. Will sync when online.");
    return;
  }

  try {
    await axios.post("/api/attendance/mark-batch", {
      termId: currentTerm._id,
      classId: selectedClass,
      date: selectedDate,
      attendanceList,
      teacherId: teacherData.teacherId,
      teacherEmail: teacherData.teacherEmail,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSubmittedDates((prev) => new Set(prev).add(`${selectedClass}_${selectedDate}`));
    toast.success("Attendance marked successfully!");
  } catch (err) {
    console.error("Error marking attendance:", err);
    toast.error("Error marking attendance.");
  }
};

// Automatically fetch attendance when class/date changes
useEffect(() => {
  if (selectedClass && selectedDate) {
    if (offlineMode) {
      fetchAttendanceForDate(selectedClass, selectedDate);
    } else {
      fetchAttendanceForDate(selectedClass, selectedDate);
    }
  }
}, [selectedClass, selectedDate, offlineMode]);

// Fetch current term and teacher's classes on mount
useEffect(() => {
  if (!offlineMode) {
    fetchCurrentTerm();
    fetchClasses();
  } else {
    // Load cached term and classes for offline mode
    const cachedTerm = JSON.parse(localStorage.getItem("offlineCurrentTerm"));
    if (cachedTerm) setCurrentTerm(cachedTerm);

    const cachedClasses = JSON.parse(localStorage.getItem("offlineClasses")) || [];
    setClasses(cachedClasses);
  }
}, [offlineMode]);

return (
  <div>
    <Sidebar />
    <Header />
    <div className="attendance-container">
      <h2 className="attendance-title">Mark Attendance</h2>

      {/* Class Selector */}
      <select
        className="class-selector"
        onChange={(e) => {
          const clsId = e.target.value;
          setSelectedClass(clsId);

          if (offlineMode) {
            // Load students from cached offline data
            const cachedClasses = JSON.parse(localStorage.getItem("offlineClasses")) || [];
            const cachedStudents = cachedClasses.find((c) => c._id === clsId)?.students || [];
            setStudents(cachedStudents);
            setSelectedDate(new Date().toISOString().slice(0, 10)); // default to today
          } else {
            // Online fetch
            fetchStudents(clsId);
          }
        }}
        value={selectedClass || ""}
      >
        <option value="">Select Class</option>
        {(offlineMode
          ? JSON.parse(localStorage.getItem("offlineClasses")) || []
          : classes
        ).map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.className}
          </option>
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
        disabled={!selectedClass}
      />

      {/* Attendance warning or status */}
      {selectedClass &&
        selectedDate &&
        submittedDates.has(`${selectedClass}_${selectedDate}`) &&
        !isEditing && (
          <p className="attendance-warning">
            ⚠️ Attendance for this class on this date has already been submitted.
          </p>
        )}

      {/* Students List */}
      {loading ? (
        <p className="loading-message">Loading students...</p>
      ) : students.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Present?</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="student-row">
                <td className="student-name">{student.name}</td>
                <td className="attendance-checkbox">
                  <input
                    type="checkbox"
                    checked={attendance[student._id] || false}
                    onChange={(e) =>
                      handleAttendanceChange(student._id, e.target.checked)
                    }
                    disabled={
                      (submittedDates.has(`${selectedClass}_${selectedDate}`) &&
                        !isEditing) ||
                      offlineMode // prevent submission while offline
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-students-message">
          {offlineMode
            ? "Offline: No cached students found for this class."
            : "No students found for this class."}
        </p>
      )}

      {/* Submit or Edit Button */}
      {submittedDates.has(`${selectedClass}_${selectedDate}`) ? (
        isEditing ? (
          <button
            className="submit-button"
            onClick={handleSubmitClick}
            disabled={!selectedClass || !students.length || offlineMode}
          >
            Save Edited Attendance
          </button>
        ) : (
          <button
            className="edit-button"
            onClick={handleEditClick}
            disabled={!selectedClass || !students.length || offlineMode}
          >
            Edit Attendance
          </button>
        )
      ) : (
        <button
          className="submit-button"
          onClick={handleSubmitClick}
          disabled={!selectedClass || !students.length || offlineMode}
        >
          Submit Attendance
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {isEditing
                ? "Confirm Attendance Update"
                : "Confirm Attendance Submission"}
            </h3>
            <p>
              Are you sure you want to{" "}
              {isEditing ? "update" : "submit"} attendance for this class on{" "}
              {selectedDate}?
            </p>
            <button
              className="modal-confirm"
              onClick={isEditing ? updateAttendance : submitAttendance}
              disabled={offlineMode}
            >
              Confirm
            </button>
            <button className="modal-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Attendance;