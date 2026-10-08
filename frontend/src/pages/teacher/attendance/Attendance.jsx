import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import PageHeader from "../../../components/ui/PageHeader";
import "./Attendance.modules.css";
import {
  ClipboardCheck,
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  WifiOff,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

// ── Token helpers ──────────────────────────────────────────────
const getDataFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const d = JSON.parse(atob(token.split(".")[1]));
    return {
      teacherId:    d?.id    || null,
      teacherEmail: d?.email || null,
      schoolId:     d?.schoolId || null,
    };
  } catch { return null; }
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

const makeSubmissionKey = (classId, date) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (isNaN(parsed)) return null;
  return `${classId}_${parsed.toISOString().split("T")[0]}`;
};

// ══════════════════════════════════════════════════════════════
const Attendance = () => {
  // ── Core state ──
  const [classes,             setClasses]             = useState([]);
  const [showModal,           setShowModal]           = useState(false);
  const [students,            setStudents]            = useState([]);
  const [selectedClass,       setSelectedClass]       = useState(null);
  const [attendance,          setAttendance]          = useState({});
  const [currentTerm,         setCurrentTerm]         = useState(null);
  const [loading,             setLoading]             = useState(false);
  const [selectedDate,        setSelectedDate]        = useState("");
  const [submittedDates,      setSubmittedDates]      = useState(new Set());
  const [existingAttendance,  setExistingAttendance]  = useState({});
  const [attendanceIds,       setAttendanceIds]       = useState({});
  const [isEditing,           setIsEditing]           = useState(false);
  const [offlineMode,         setOfflineMode]         = useState(() => !navigator.onLine);
  const [unmarkedDates,       setUnmarkedDates]       = useState([]);
  const [loadingUnmarked,     setLoadingUnmarked]     = useState(false);

  const token = localStorage.getItem("token");

  // ── Connectivity ──
  const checkOnlineStatus = async () => {
    try { await axios.get("/ping"); setOfflineMode(false); }
    catch { setOfflineMode(true); }
  };
  useEffect(() => { checkOnlineStatus(); }, []);

  // ── Quick actions ──
  const handleMarkAllPresent = () => {
    const all = {};
    students.forEach((s) => { all[s._id] = true; });
    setAttendance(all);
    toast.success("All students marked present.");
  };

  const handleClearAll = () => {
    const all = {};
    students.forEach((s) => { all[s._id] = false; });
    setAttendance(all);
    toast.success("All students marked absent.");
  };

  // ── Fetch helpers ──
  const fetchCurrentTerm = async () => {
    if (offlineMode) {
      const cached = JSON.parse(localStorage.getItem("offlineCurrentTerm"));
      if (cached) { setCurrentTerm(cached); toast.success("Offline: Loaded cached term."); }
      else toast.error("Offline: No cached term available.");
      return;
    }
    try {
      const { data } = await axios.get("/api/terms/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentTerm(data);
      localStorage.setItem("offlineCurrentTerm", JSON.stringify(data));
    } catch { toast.error("Failed to fetch current term."); }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.classes || []);
      localStorage.setItem("offlineClasses", JSON.stringify(res.data.classes || []));
    } catch {
      if (offlineMode) {
        const cached = JSON.parse(localStorage.getItem("offlineClasses")) || [];
        setClasses(cached);
      } else toast.error("Failed to load classes.");
    } finally { setLoading(false); }
  };

  const fetchUnmarkedDatesForClass = async (classId, termId) => {
    if (!classId || !termId) return;
    setLoadingUnmarked(true);
    try {
      const res = await axios.get("/api/attendance/unmarked-dates", {
        params: { classId, termId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const today = new Date().toISOString().slice(0, 10);
      setUnmarkedDates(
        (res.data?.unmarkedDates || []).map((d) => d.slice(0, 10)).filter((d) => d <= today)
      );
    } catch { toast.error("Could not load unmarked dates."); }
    finally { setLoadingUnmarked(false); }
  };

  const fetchStudents = async (classId) => {
    if (!classId) return;
    try {
      setLoading(true);
      let data = [];
      if (!offlineMode) {
        const res = await axios.get(`/api/student/class/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = Array.isArray(res.data) ? res.data : res.data.students || [];
        localStorage.setItem(`offlineStudents_${classId}`, JSON.stringify(data));
      } else {
        data = JSON.parse(localStorage.getItem(`offlineStudents_${classId}`)) || [];
        if (data.length) toast.success("Offline: Loaded cached students.");
      }
      const init = {};
      data.forEach((s) => { init[s._id] = false; });
      setAttendance(init);
      setStudents(data);
      setSelectedDate(new Date().toISOString().slice(0, 10));
    } catch { if (!offlineMode) toast.error("Failed to load students."); }
    finally { setLoading(false); }
  };

  const fetchAttendanceForDate = async (classId, date) => {
    if (!classId || !date || !currentTerm) return;
    const key       = makeSubmissionKey(classId, date);
    const offKey    = `offlineAttendance_${key}`;
    const cached    = JSON.parse(localStorage.getItem(offKey)) || [];

    if (cached.length) {
      const map = {};
      cached.forEach((r) => { map[r.studentId] = r.present; });
      setAttendance(map); setExistingAttendance(map);
      setSubmittedDates((p) => new Set(p).add(key));
      toast.success("Loaded offline attendance for this date.");
    } else if (offlineMode) {
      setAttendance({}); setExistingAttendance({});
      return;
    }

    if (!offlineMode) {
      try {
        const res = await axios.get("/api/attendance/fetch", {
          params: { termId: currentTerm._id, classId, date },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.length) {
          setSubmittedDates((p) => new Set(p).add(key));
          const aMap = {}, idMap = {};
          res.data.forEach((r) => {
            aMap[r.studentId._id]  = r.present;
            idMap[r.studentId._id] = r._id;
          });
          cached.forEach((r) => { aMap[r.studentId] = r.present; });
          setAttendance(aMap); setExistingAttendance(aMap); setAttendanceIds(idMap);
        }
      } catch { toast.error("Failed to fetch attendance from server."); }
    }
  };

  // ── Submit / update / sync ──
  const submitAttendance = async () => {
    setShowModal(false);
    if (!currentTerm)  return toast.error("Term not found!");
    if (!selectedDate) return toast.error("Please select a date.");
    if (isWeekend(selectedDate)) return toast.error("Cannot mark attendance on weekends.");

    const parsed = new Date(selectedDate);
    if (isNaN(parsed)) return;
    const dateKey       = parsed.toISOString().split("T")[0];
    const submissionKey = `${selectedClass}_${dateKey}`;

    if (submittedDates.has(submissionKey))
      return toast.error("Attendance already recorded for this date.");

    const teacherData   = getDataFromToken();
    if (!teacherData)   return toast.error("Invalid token or teacher data missing!");
    const attendanceList = students.map((s) => ({ studentId: s._id, present: attendance[s._id] || false }));

    if (offlineMode) {
      localStorage.setItem(`offlineAttendance_${selectedClass}_${dateKey}`, JSON.stringify(attendanceList));
      setSubmittedDates((p) => new Set(p).add(submissionKey));
      toast.success("Offline: Attendance saved locally.");
      return;
    }

    try {
      await axios.post("/api/attendance/mark-batch", {
        termId: currentTerm._id, classId: selectedClass, date: dateKey,
        attendanceList, teacherId: teacherData.teacherId, teacherEmail: teacherData.teacherEmail,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmittedDates((p) => new Set(p).add(submissionKey));
      setUnmarkedDates((p) => p.filter((d) => d !== dateKey));
      toast.success("Attendance marked successfully!");
    } catch { toast.error("Error marking attendance."); }
  };

  const updateAttendance = async () => {
    setShowModal(false);
    const teacherData = getDataFromToken();
    if (!teacherData) return toast.error("Invalid token or teacher data missing!");
    const key = makeSubmissionKey(selectedClass, selectedDate);

    if (offlineMode) {
      localStorage.setItem(`offlineAttendance_${key}`, JSON.stringify(
        students.map((s) => ({ studentId: s._id, present: attendance[s._id] || false }))
      ));
      setSubmittedDates((p) => new Set(p).add(key));
      toast.success("Offline: Attendance saved locally.");
      setIsEditing(false);
      return;
    }

    try {
      const updates = [];
      students.forEach((s) => {
        const present = attendance[s._id];
        if (present !== existingAttendance[s._id] && attendanceIds[s._id]) {
          updates.push(axios.put(`/api/attendance/update/${attendanceIds[s._id]}`,
            { present }, { headers: { Authorization: `Bearer ${token}` } }));
        }
      });
      await Promise.all(updates);
      toast.success("Attendance updated successfully!");
      setIsEditing(false);
    } catch { toast.error("Failed to update attendance."); }
  };

  const syncOfflineAttendance = async () => {
    const teacherData = getDataFromToken();
    if (!teacherData || !currentTerm) return;
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("offlineAttendance_"));
      for (const k of keys) {
        const parts = k.split("_");
        if (parts.length < 3) continue;
        const classId = parts[1];
        const date    = parts.slice(2).join("_");
        const list    = JSON.parse(localStorage.getItem(k));
        if (!list?.length) continue;
        await axios.post("/api/attendance/mark-batch", {
          termId: currentTerm._id, classId, date, attendanceList: list,
          teacherId: teacherData.teacherId, teacherEmail: teacherData.teacherEmail,
        }, { headers: { Authorization: `Bearer ${token}` } });
        localStorage.removeItem(k);
      }
    } catch { toast.error("Error syncing offline attendance."); }
  };

  // ── Effects ──
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      toast("Back online. Syncing…", { icon: "🔄" });
      syncOfflineAttendance();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (!offlineMode) syncOfflineAttendance();
  }, [offlineMode, currentTerm]);

  useEffect(() => {
    if (selectedClass && selectedDate) fetchAttendanceForDate(selectedClass, selectedDate);
  }, [selectedClass, selectedDate, offlineMode]);

  useEffect(() => {
    if (selectedClass && currentTerm && !offlineMode)
      fetchUnmarkedDatesForClass(selectedClass, currentTerm._id);
  }, [selectedClass, currentTerm, offlineMode]);

  useEffect(() => {
    if (!offlineMode) { fetchCurrentTerm(); fetchClasses(); }
    else {
      const t = JSON.parse(localStorage.getItem("offlineCurrentTerm"));
      if (t) setCurrentTerm(t);
      setClasses(JSON.parse(localStorage.getItem("offlineClasses")) || []);
    }
  }, [offlineMode]);

  // ── Derived ──
  const submissionKey  = makeSubmissionKey(selectedClass, selectedDate);
  const alreadyMarked  = submittedDates.has(submissionKey);
  const isLocked       = alreadyMarked && !isEditing;
  const presentCount   = students.filter((s) => attendance[s._id]).length;
  const absentCount    = students.length - presentCount;

  // ── Render ──
  return (
    <div className="att-page">

      {/* ══ MAIN ════════════════════════════════════ */}
      <main className="att-main">

        <PageHeader title="Mark attendance" subtitle="Select a class and date to record student attendance."
          actions={offlineMode ? <span className="att-offline-notice"><WifiOff size={15} /> Working offline — changes saved on this device</span> : null} />

        {/* ── Controls card ── */}
        <div className="td-card att-controls-card">
          <div className="att-controls-row">

            {/* Class selector */}
            <div className="att-field">
              <label className="att-label">
                <Users size={14} /> Class
              </label>
              <div className="att-select-wrap">
                <select
                  className="att-select"
                  value={selectedClass || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedClass(id);
                    if (id) {
                      if (offlineMode) {
                        const cached = JSON.parse(localStorage.getItem(`offlineStudents_${id}`)) || [];
                        setStudents(cached);
                        const init = {};
                        cached.forEach((s) => { init[s._id] = false; });
                        setAttendance(init);
                        setSelectedDate(new Date().toISOString().slice(0, 10));
                        if (cached.length) toast.success("Offline: Loaded cached students.");
                      } else { fetchStudents(id); }
                    } else { setStudents([]); setAttendance({}); }
                  }}
                >
                  <option value="">Select a class…</option>
                  {(offlineMode ? JSON.parse(localStorage.getItem("offlineClasses")) || [] : classes)
                    .map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.className}</option>
                    ))}
                </select>
                <ChevronRight size={15} className="att-select-chevron" />
              </div>
            </div>

            {/* Date selector */}
            <div className="att-field">
              <label className="att-label">
                <CalendarDays size={14} /> Date
              </label>
              <input
                type="date"
                className="att-date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={currentTerm?.startDate?.slice(0, 10)}
                max={currentTerm?.endDate?.slice(0, 10)}
                disabled={!selectedClass}
              />
            </div>
          </div>

          {/* Unmarked dates */}
          {selectedClass && !offlineMode && (
            <div className="att-unmarked-section">
              <p className="att-unmarked-label">
                Unmarked Dates
                {unmarkedDates.length > 0 && (
                  <span className="att-unmarked-count">{unmarkedDates.length}</span>
                )}
              </p>
              {loadingUnmarked ? (
                <p className="att-muted-text">Loading…</p>
              ) : unmarkedDates.length === 0 ? (
                <p className="att-all-done">
                  <CheckCircle2 size={14} /> All dates submitted!
                </p>
              ) : (
                <div className="att-chip-list">
                  {unmarkedDates.map((d, i) => {
                    const fmt = new Date(d).toISOString().split("T")[0];
                    return (
                      <button
                        key={i}
                        className={`att-chip ${fmt === selectedDate ? "att-chip-active" : ""}`}
                        onClick={() => {
                          setSelectedDate(fmt);
                          toast.success(`Loading attendance for ${fmt}`);
                        }}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Already-submitted warning ── */}
        {selectedClass && submissionKey && alreadyMarked && !isEditing && (
          <div className="att-warning-banner">
            <AlertTriangle size={16} />
            Attendance for this class on <strong>{selectedDate}</strong> has already been submitted.
          </div>
        )}

        {/* ── Student list card ── */}
        {loading ? (
          <div className="td-card att-loading-card">
            <div className="att-loading-dots">
              <span /><span /><span />
            </div>
            <p className="att-muted-text">Loading students…</p>
          </div>
        ) : students.length > 0 ? (
          <div className="td-card att-students-card">

            {/* Card header */}
            <div className="td-card-header">
              <Users size={20} className="td-card-icon icon-teal" />
              <h2>Student List</h2>
              {/* Stats */}
              <div className="att-stats">
                <span className="att-stat att-stat-present">
                  <CheckCircle2 size={13} /> {presentCount} Present
                </span>
                <span className="att-stat att-stat-absent">
                  <XCircle size={13} /> {absentCount} Absent
                </span>
              </div>
            </div>

            {/* Quick-action row */}
            {!isLocked && (
              <div className="att-quick-row">
                <button className="att-quick-btn att-quick-present" onClick={handleMarkAllPresent}>
                  <CheckCircle2 size={15} /> Mark All Present
                </button>
                <button className="att-quick-btn att-quick-absent" onClick={handleClearAll}>
                  <XCircle size={15} /> Clear All
                </button>
              </div>
            )}

            {/* Table */}
            <div className="att-table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Present?</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const isPresent = attendance[student._id] || false;
                    return (
                      <tr key={student._id} className={isPresent ? "row-present" : "row-absent"}>
                        <td className="att-td-num">{idx + 1}</td>
                        <td className="att-td-name">{student.name || "Unnamed Student"}</td>
                        <td>
                          <span className={`att-status-badge ${isPresent ? "badge-present" : "badge-absent"}`}>
                            {isPresent ? "Present" : "Absent"}
                          </span>
                        </td>
                        <td className="att-td-check">
                          <label className="att-toggle">
                            <input
                              type="checkbox"
                              checked={isPresent}
                              disabled={isLocked}
                              onChange={(e) =>
                                setAttendance((p) => ({ ...p, [student._id]: e.target.checked }))
                              }
                            />
                            <span className="att-toggle-track">
                              <span className="att-toggle-thumb" />
                            </span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Submit / Edit button */}
            <div className="att-action-row">
              {alreadyMarked ? (
                isEditing ? (
                  <button
                    className="att-btn att-btn-primary"
                    onClick={() => setShowModal(true)}
                    disabled={!selectedClass || !students.length}
                  >
                    <RotateCcw size={16} /> Save Edited Attendance
                  </button>
                ) : (
                  <button
                    className="att-btn att-btn-secondary"
                    onClick={() => { setIsEditing(true); setShowModal(false); }}
                    disabled={!selectedClass || !students.length}
                  >
                    Edit Attendance
                  </button>
                )
              ) : (
                <button
                  className="att-btn att-btn-primary"
                  onClick={() => setShowModal(true)}
                  disabled={!selectedClass || !students.length}
                >
                  <ClipboardCheck size={16} /> Submit Attendance
                </button>
              )}
            </div>
          </div>
        ) : selectedClass ? (
          <div className="td-card">
            <div className="td-empty-state">
              <span className="td-empty-icon">👨‍🎓</span>
              <p>
                {offlineMode
                  ? "Offline: No cached students found for this class."
                  : "No students found for this class."}
              </p>
            </div>
          </div>
        ) : null}

      </main>

      {/* ══ CONFIRM MODAL ════════════════════════════ */}
      {showModal && (
        <div className="att-modal-overlay">
          <div className="att-modal">
            <div className="att-modal-icon">
              <ClipboardCheck size={28} />
            </div>
            <h3 className="att-modal-title">
              {isEditing ? "Confirm Update" : "Confirm Submission"}
            </h3>
            <p className="att-modal-body">
              {isEditing ? "Update" : "Submit"} attendance for{" "}
              <strong>{selectedDate}</strong>?
              <br />
              <span className="att-modal-stats">
                {presentCount} present · {absentCount} absent
              </span>
            </p>
            <div className="att-modal-actions">
              <button
                className="att-btn att-btn-primary"
                onClick={isEditing ? updateAttendance : submitAttendance}
              >
                Confirm
              </button>
              <button
                className="att-btn att-btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;