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
      schoolId: decodedToken?.schoolId || null,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to check if a date is a weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

// Safe helper function
const makeSubmissionKey = (classId, date) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (isNaN(parsed)) return null;
  const dateKey = parsed.toISOString().split("T")[0];
  return `${classId}_${dateKey}`;
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
  const [existingAttendance, setExistingAttendance] = useState({});
  const [attendanceIds, setAttendanceIds] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);
  const [unmarkedDates, setUnmarkedDates] = useState([]);
  const [loadingUnmarked, setLoadingUnmarked] = useState(false);

  // Function to check connectivity via /ping
  const checkOnlineStatus = async () => {
    try {
      await axios.get("/ping");
      setOfflineMode(false);
    } catch (err) {
      setOfflineMode(true);
    }
  };

  const handleUnmarkedDateClick = (dateObj) => {
    if (!dateObj) return;
    const formatted = new Date(dateObj).toISOString().split("T")[0];
    setSelectedDate(formatted);
    toast.success(`Loading attendance for ${formatted}`);
  };

  // ✅ Mark all students present at once
  const handleMarkAllPresent = () => {
    const allPresent = {};
    students.forEach((s) => {
      allPresent[s._id] = true;
    });
    setAttendance(allPresent);
    toast.success("All students marked present.");
  };

  // ✅ Clear all (mark all absent)
  const handleClearAll = () => {
    const allAbsent = {};
    students.forEach((s) => {
      allAbsent[s._id] = false;
    });
    setAttendance(allAbsent);
    toast.success("All students marked absent.");
  };

  // Check only on mount
  useEffect(() => {
    checkOnlineStatus();
  }, []);

  const token = localStorage.getItem("token");
  const schoolId = getDataFromToken();

  const handleSubmitClick = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Fetch the most recent term
  const fetchCurrentTerm = async () => {
    if (!schoolId) return;

    if (offlineMode) {
      const cachedTerm = JSON.parse(localStorage.getItem("offlineCurrentTerm"));
      if (cachedTerm) {
        setCurrentTerm(cachedTerm);
        toast.success("Offline: Loaded cached term.");
      } else {
        toast.error("Offline: No cached term is available.");
      }
      return;
    }

    try {
      const { data } = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentTerm(data);
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

  // Fetch unmarked dates for a class
  const fetchUnmarkedDatesForClass = async (classId, termId) => {
    if (!classId || !termId) return;

    setLoadingUnmarked(true);

    try {
      const res = await axios.get("/api/attendance/unmarked-dates", {
        params: { classId, termId },
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawDates = res.data?.unmarkedDates || [];
      const normalizedDates = rawDates.map((d) => d.slice(0, 10));
      const today = new Date().toISOString().slice(0, 10);
      const filteredDates = normalizedDates.filter((date) => date <= today);

      setUnmarkedDates(filteredDates);
    } catch (err) {
      console.error("Error fetching unmarked dates:", err);
      toast.error("Could not load unmarked dates.");
    } finally {
      setLoadingUnmarked(false);
    }
  };

  const fetchStudents = async (classId) => {
    if (!classId) return;
    try {
      setLoading(true);
      let studentData = [];

      if (!offlineMode) {
        const res = await axios.get(`/api/student/class/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        studentData = Array.isArray(res.data) ? res.data : res.data.students || [];
        localStorage.setItem(`offlineStudents_${classId}`, JSON.stringify(studentData));
      } else {
        const cached = JSON.parse(localStorage.getItem(`offlineStudents_${classId}`)) || [];
        studentData = cached;
        if (studentData.length > 0) {
          toast.success("Offline: Loaded cached students.");
        }
      }

      const initialAttendance = {};
      studentData.forEach((s) => {
        initialAttendance[s._id] = false;
      });

      setAttendance(initialAttendance);
      setStudents(studentData);
      setSelectedDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error("Error loading students:", err);
      if (!offlineMode) toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance for a given date
  const fetchAttendanceForDate = async (classId, date) => {
    if (!classId || !date || !currentTerm) return;

    const submissionKey = makeSubmissionKey(classId, date);
    const offlineKey = `offlineAttendance_${submissionKey}`;
    const cachedOffline = JSON.parse(localStorage.getItem(offlineKey)) || [];

    if (cachedOffline.length > 0) {
      const offlineMap = {};
      cachedOffline.forEach((rec) => {
        offlineMap[rec.studentId] = rec.present;
      });
      setAttendance(offlineMap);
      setExistingAttendance(offlineMap);
      setSubmittedDates((prev) => new Set(prev).add(submissionKey));
      toast.success("Loaded offline attendance for this date.");
    } else if (offlineMode) {
      setAttendance({});
      setExistingAttendance({});
      toast.info("Offline: No cached attendance for this date.");
      return;
    }

    if (!offlineMode) {
      try {
        const res = await axios.get(`/api/attendance/fetch`, {
          params: { termId: currentTerm._id, classId, date },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.length > 0) {
          setSubmittedDates((prev) => new Set(prev).add(submissionKey));

          const attendanceMap = {};
          const idMap = {};
          res.data.forEach((record) => {
            attendanceMap[record.studentId._id] = record.present;
            idMap[record.studentId._id] = record._id;
          });

          cachedOffline.forEach((rec) => {
            attendanceMap[rec.studentId] = rec.present;
          });

          setAttendance(attendanceMap);
          setExistingAttendance(attendanceMap);
          setAttendanceIds(idMap);
        }
      } catch (err) {
        console.error("Error fetching online attendance:", err);
        toast.error("Failed to fetch attendance from server.");
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowModal(false);
  };

  // Submit updated attendance
  const updateAttendance = async () => {
    setShowModal(false);
    const teacherData = getDataFromToken();
    if (!teacherData) return toast.error("Invalid token or teacher data missing!");

    const submissionKey = makeSubmissionKey(selectedClass, selectedDate);

    if (offlineMode) {
      const key = `offlineAttendance_${submissionKey}`;
      const attendanceList = students.map((student) => ({
        studentId: student._id,
        present: attendance[student._id] || false,
      }));
      localStorage.setItem(key, JSON.stringify(attendanceList));
      setSubmittedDates((prev) => new Set(prev).add(submissionKey));
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

  const handleAttendanceChange = (studentId, present) => {
    setAttendance((prev) => ({ ...prev, [studentId]: present }));
  };

  // Submit new attendance
  const submitAttendance = async () => {
    setShowModal(false);

    if (!currentTerm) return toast.error("Term not found!");
    if (!selectedDate) return toast.error("Please select a date.");
    if (isWeekend(selectedDate)) return toast.error("Cannot mark attendance on weekends.");

    let dateKey = null;
    let submissionKey = null;

    if (selectedDate) {
      const parsed = new Date(selectedDate);
      if (!isNaN(parsed)) {
        dateKey = parsed.toISOString().split("T")[0];
        submissionKey = `${selectedClass}_${dateKey}`;
      }
    }

    if (submittedDates.has(submissionKey)) {
      return toast.error("Attendance for this class on this date is already recorded.");
    }

    const teacherData = getDataFromToken();
    if (!teacherData) return toast.error("Invalid token or teacher data missing!");

    const attendanceList = students.map((student) => ({
      studentId: student._id,
      present: attendance[student._id] || false,
    }));

    if (offlineMode) {
      const key = `offlineAttendance_${selectedClass}_${dateKey}`;
      localStorage.setItem(key, JSON.stringify(attendanceList));

      setSubmittedDates((prev) => {
        const updated = new Set(prev);
        updated.add(submissionKey);
        return updated;
      });

      toast.success("Offline: Attendance saved locally. Will sync when online.");
      return;
    }

    try {
      await axios.post(
        "/api/attendance/mark-batch",
        {
          termId: currentTerm._id,
          classId: selectedClass,
          date: dateKey,
          attendanceList,
          teacherId: teacherData.teacherId,
          teacherEmail: teacherData.teacherEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubmittedDates((prev) => {
        const updated = new Set(prev);
        updated.add(submissionKey);
        return updated;
      });

      setUnmarkedDates((prev) => prev.filter((d) => d !== dateKey));
      toast.success("Attendance marked successfully!");
    } catch (err) {
      console.error("Error marking attendance:", err);
      toast.error("Error marking attendance.");
    }
  };

  // Sync offline attendance to server
  const syncOfflineAttendance = async () => {
    const teacherData = getDataFromToken();
    if (!teacherData) return toast.error("Cannot sync: invalid teacher data.");
    if (!currentTerm) return toast.info("Cannot sync yet: current term not loaded.");

    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("offlineAttendance_")
      );
      if (!keys.length) return;

      for (const key of keys) {
        const parts = key.split("_");
        if (parts.length < 3) continue;

        const classId = parts[1];
        const date = parts.slice(2).join("_");

        const attendanceList = JSON.parse(localStorage.getItem(key));
        if (!attendanceList?.length) continue;

        await axios.post(
          "/api/attendance/mark-batch",
          {
            termId: currentTerm._id,
            classId,
            date,
            attendanceList,
            teacherId: teacherData.teacherId,
            teacherEmail: teacherData.teacherEmail,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.removeItem(key);
      }
    } catch (err) {
      console.error("Error syncing offline attendance:", err);
      toast.error("Error syncing offline attendance. Will retry later.");
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      toast.info("Back online. Syncing offline attendance...");
      syncOfflineAttendance();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (!offlineMode) {
      syncOfflineAttendance();
    }
  }, [offlineMode, currentTerm]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendanceForDate(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate, offlineMode]);

  useEffect(() => {
    if (selectedClass && currentTerm && !offlineMode) {
      fetchUnmarkedDatesForClass(selectedClass, currentTerm._id);
    }
  }, [selectedClass, currentTerm, offlineMode]);

  useEffect(() => {
    if (!offlineMode) {
      fetchCurrentTerm();
      fetchClasses();
    } else {
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

            if (clsId) {
              if (offlineMode) {
                const cachedStudents =
                  JSON.parse(localStorage.getItem(`offlineStudents_${clsId}`)) || [];

                setStudents(cachedStudents);

                const initialAttendance = {};
                cachedStudents.forEach((s) => {
                  initialAttendance[s._id] = false;
                });
                setAttendance(initialAttendance);
                setSelectedDate(new Date().toISOString().slice(0, 10));

                if (cachedStudents.length > 0) {
                  toast.success("Offline: Loaded cached students.");
                }
              } else {
                fetchStudents(clsId);
              }
            } else {
              setStudents([]);
              setAttendance({});
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

        {/* Unmarked Dates Section */}
        {selectedClass && !offlineMode && (
          <div className="unmarked-dates-container">
            <h3 className="unmarked-dates-title">
              Unmarked Dates {unmarkedDates.length > 0 && `(${unmarkedDates.length})`}
            </h3>

            {loadingUnmarked ? (
              <p className="loading-unmarked">Loading unmarked dates...</p>
            ) : unmarkedDates.length === 0 ? (
              <p className="no-unmarked">All attendance submitted!</p>
            ) : (
              <div className="unmarked-dates-list">
                {unmarkedDates.map((dateStr, idx) => {
                  const formatted = new Date(dateStr).toISOString().split("T")[0];
                  return (
                    <button
                      key={idx}
                      className={`unmarked-date-chip ${
                        formatted === selectedDate ? "chip-active" : ""
                      }`}
                      onClick={() => handleUnmarkedDateClick(dateStr)}
                    >
                      {formatted}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(() => {
          const submissionKey = makeSubmissionKey(selectedClass, selectedDate);

          return (
            <>
              {/* Attendance warning */}
              {selectedClass && submissionKey && submittedDates.has(submissionKey) && !isEditing && (
                <p className="attendance-warning">
                  ⚠️ Attendance for this class on this date has already been submitted.
                </p>
              )}

              {/* Students List */}
              {loading ? (
                <p className="loading-message">Loading students...</p>
              ) : students.length > 0 ? (
                <>
                  {/* ✅ Quick-action buttons — only visible when editable */}
                  {(!submittedDates.has(submissionKey) || isEditing) && (
                    <div className="attendance-quick-actions">
                      <button
                        className="mark-all-btn"
                        onClick={handleMarkAllPresent}
                        type="button"
                      >
                        ✓ Mark All Present
                      </button>
                      <button
                        className="clear-all-btn"
                        onClick={handleClearAll}
                        type="button"
                      >
                        ✗ Clear All
                      </button>
                    </div>
                  )}

                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Present?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id}>
                          <td>{student.name || "Unnamed Student"}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={attendance[student._id] || false}
                              onChange={(e) =>
                                handleAttendanceChange(student._id, e.target.checked)
                              }
                              disabled={submittedDates.has(submissionKey) && !isEditing}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="no-students-message">
                  {offlineMode
                    ? "Offline: No cached students found for this class."
                    : "No students found for this class."}
                </p>
              )}

              {/* Submit or Edit Button */}
              {submittedDates.has(submissionKey) ? (
                isEditing ? (
                  <button
                    className="submit-button"
                    onClick={handleSubmitClick}
                    disabled={!selectedClass || !students.length}
                  >
                    Save Edited Attendance
                  </button>
                ) : (
                  <button
                    className="edit-button"
                    onClick={handleEditClick}
                    disabled={!selectedClass || !students.length}
                  >
                    Edit Attendance
                  </button>
                )
              ) : (
                <button
                  className="submit-button"
                  onClick={handleSubmitClick}
                  disabled={!selectedClass || !students.length}
                >
                  Submit Attendance
                </button>
              )}
            </>
          );
        })()}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>
                {isEditing ? "Confirm Attendance Update" : "Confirm Attendance Submission"}
              </h3>
              <p>
                Are you sure you want to {isEditing ? "update" : "submit"} attendance for
                this class on {selectedDate}?
              </p>
              <button
                className="modal-confirm"
                onClick={isEditing ? updateAttendance : submitAttendance}
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