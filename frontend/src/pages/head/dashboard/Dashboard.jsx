import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../api/axios";
import Header2 from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaSpinner,
  FaArrowRight,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaChartLine,
  FaGraduationCap,
  FaClipboardList,
} from "react-icons/fa";
import {
  CalendarDays,
  BookOpen,
  TrendingUp,
  Activity,
  Users2,
  LayoutGrid,
  Bell,
  CheckCheck,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import "./Dashboard.modules.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

/* ── tiny animated counter hook ── */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

/* ── stat card with animated counter ── */
function StatCard({ title, value, icon: Icon, colorKey, trend, trendLabel, delay }) {
  const animated = useCounter(value);
  return (
    <div className={`ad-stat-card ad-stat-${colorKey}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="ad-stat-shine" />
      <div className="ad-stat-top">
        <div className="ad-stat-icon-wrap">
          <Icon size={22} />
        </div>
        <div className={`ad-stat-trend ${trend >= 0 ? "up" : "down"}`}>
          {trend >= 0 ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="ad-stat-value">{animated.toLocaleString()}</div>
      <div className="ad-stat-label">{title}</div>
      <div className="ad-stat-sub">{trendLabel}</div>
    </div>
  );
}

/* ── mini donut chart (pure CSS/SVG) ── */
function DonutChart({ percent, color, size = 72 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth="7" />
      <circle
        cx="32" cy="32" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

/* ── horizontal bar ── */
function Bar({ label, value, max, color }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div className="ad-bar-row">
      <span className="ad-bar-label">{label}</span>
      <div className="ad-bar-track">
        <div className="ad-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="ad-bar-val">{value}</span>
    </div>
  );
}

/* ────────────────────────────────── */
const NOTICES = [
  { id: 1, type: "warning", icon: FaExclamationTriangle, text: "3 teachers have not submitted this week's attendance.", time: "Today, 9:14 AM" },
  { id: 2, type: "success", icon: FaCheckCircle, text: "Term 2 reports have been approved and are ready.", time: "Yesterday, 4:30 PM" },
  { id: 3, type: "info", icon: FaClock, text: "PTA meeting scheduled for Friday at 3:00 PM.", time: "2 days ago" },
  { id: 4, type: "warning", icon: FaExclamationTriangle, text: "Fee payment deadline is in 5 days.", time: "3 days ago" },
];

const QUICK_ACTIONS = [
  { label: "Manage Students", path: "/students",  icon: FaUserGraduate,       color: "teal"   },
  { label: "Manage Teachers", path: "/teachers",  icon: FaChalkboardTeacher,  color: "purple" },
  { label: "View Reports",    path: "/view-reports", icon: FaChartLine,        color: "amber"  },
  { label: "Class Schedule",  path: "/schedule",  icon: FaClipboardList,      color: "coral"  },
  { label: "Announcements",   path: "/announcements", icon: FaBell,            color: "green"  },
  { label: "School Settings", path: "/settings",  icon: FaGraduationCap,      color: "blue"   },
];

/* ── grade distribution mock — replace with real API data ── */
const GRADE_DIST = [
  { label: "A (80–100%)", value: 142, color: "#1a8c7a" },
  { label: "B (65–79%)",  value: 218, color: "#22a896" },
  { label: "C (50–64%)",  value: 176, color: "#f5a623" },
  { label: "D (35–49%)",  value: 89,  color: "#f26b5b" },
  { label: "F (0–34%)",   value: 31,  color: "#7c5cbf" },
];

/* ────────────────────────────────── */
const Dashboard = () => {
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events,       setEvents]       = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType,    setEventType]    = useState("custom");
  const [eventTitle,   setEventTitle]   = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [schoolStats,  setSchoolStats]  = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });
  const [attendancePct, setAttendancePct] = useState(87); // replace with real data

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) { toast.error("Please login first."); navigate("/sign-in"); return; }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      await fetchSchool(parsedUser._id);
      await fetchEvents();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchSchool = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await api.get(`/api/schools/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) {
        const s = res.data.school || res.data;
        setSchoolStats({
          numberOfStudents: s.numberOfStudents || 0,
          numberOfTeachers: s.numberOfTeachers || 0,
          numberOfClasses:  s.numberOfClasses  || 0,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load school data");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/api/events/my-school", { headers: { Authorization: `Bearer ${token}` } });
      const obj = {};
      res.data.events.forEach(ev => {
        const key = new Date(ev.date).toISOString().split("T")[0];
        obj[key] = { id: ev._id, type: ev.type, title: ev.title, description: ev.description };
      });
      setEvents(obj);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const key = date.toISOString().split("T")[0];
    const existing = events[key];
    if (existing) {
      setEditingEvent(existing);
      setEventType(existing.type);
      setEventTitle(existing.title === "Holiday" ? "" : existing.title);
      setEventDescription(existing.description || "");
    } else {
      setEditingEvent(null);
      setEventType("custom");
      setEventTitle("");
      setEventDescription("");
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const key = selectedDate.toISOString().split("T")[0];
      if (eventType === "custom" && !eventTitle.trim()) { toast.error("Please enter an event title"); return; }
      const payload = { date: key, type: eventType, title: eventType === "holiday" ? "Holiday" : eventTitle, description: eventDescription };
      if (editingEvent) {
        await api.put(`/api/events/${editingEvent.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Event updated");
      } else {
        await api.post("/api/events", payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Event created");
      }
      await fetchEvents();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent || !window.confirm("Delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/events/${editingEvent.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Event deleted");
      await fetchEvents();
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEventType("custom");
    setEventTitle("");
    setEventDescription("");
    setEditingEvent(null);
  };

  const formattedDate  = selectedDate.toISOString().split("T")[0];
  const selectedEvent  = events[formattedDate];
  const totalStudents  = schoolStats.numberOfStudents;
  const totalTeachers  = schoolStats.numberOfTeachers;
  const totalClasses   = schoolStats.numberOfClasses;
  const maxGrade       = Math.max(...GRADE_DIST.map(g => g.value));

  if (!user || loading) {
    return (
      <div className="ad-loading-screen">
        <FaSpinner className="ad-spinner" />
      </div>
    );
  }

  return (
    <div className="ad-page">
      <Sidebar />

      <div className="ad-body">
        <Header2 />

        <main className="ad-main">

          {/* ── Welcome Banner ── */}
          <section className="ad-welcome">
            <div className="ad-welcome-blob" />
            <div className="ad-welcome-blob2" />
            <div className="ad-welcome-left">
              <div className="ad-welcome-badge">
                <Sparkles size={13} />
                Admin Overview
              </div>
              <h1 className="ad-welcome-title">
                Welcome back, {user.name?.split(" ")[0] || "Admin"} 👋
              </h1>
              <p className="ad-welcome-sub">
                Here's a full snapshot of your school's performance today.
              </p>
            </div>
            <div className="ad-welcome-date-pill">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
          </section>

          {/* ── Stat Cards ── */}
          <section className="ad-stats-row">
            <StatCard title="Total Students"  value={totalStudents}  icon={FaUserGraduate}      colorKey="teal"   trend={12}  trendLabel="vs last term"  delay={0}   />
            <StatCard title="Total Teachers"  value={totalTeachers}  icon={FaChalkboardTeacher} colorKey="purple" trend={4}   trendLabel="vs last term"  delay={80}  />
            <StatCard title="Active Classes"  value={totalClasses}   icon={Users2}              colorKey="amber"  trend={-2}  trendLabel="vs last term"  delay={160} />
            <StatCard title="Books Available" value={1284}           icon={BookOpen}            colorKey="coral"  trend={8}   trendLabel="added this term" delay={240} />
          </section>

          {/* ── Middle Row ── */}
          <section className="ad-mid-row">

            {/* Attendance Overview */}
            <div className="ad-card ad-attendance-card">
              <div className="ad-card-header">
                <Activity size={18} className="icon-teal" />
                <h2>Attendance Overview</h2>
                <span className="ad-card-badge teal">Today</span>
              </div>

              <div className="ad-att-donut-row">
                <div className="ad-att-donut-wrap">
                  <DonutChart percent={attendancePct} color="var(--teal)" size={88} />
                  <div className="ad-att-donut-center">
                    <span className="ad-att-pct">{attendancePct}%</span>
                    <span className="ad-att-pct-label">Present</span>
                  </div>
                </div>
                <div className="ad-att-legend">
                  <div className="ad-att-legend-item">
                    <span className="ad-att-legend-dot" style={{ background: "var(--teal)" }} />
                    <span>Present <strong>{Math.round(totalStudents * attendancePct / 100)}</strong></span>
                  </div>
                  <div className="ad-att-legend-item">
                    <span className="ad-att-legend-dot" style={{ background: "var(--coral)" }} />
                    <span>Absent <strong>{Math.round(totalStudents * (100 - attendancePct) / 100)}</strong></span>
                  </div>
                  <div className="ad-att-legend-item">
                    <span className="ad-att-legend-dot" style={{ background: "var(--amber)" }} />
                    <span>Late <strong>{Math.round(totalStudents * 0.04)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="ad-att-classes">
                <p className="ad-att-classes-label">By Class Level</p>
                <Bar label="Grade 6" value={96} max={100} color="var(--teal)" />
                <Bar label="Grade 7" value={88} max={100} color="var(--teal-mid)" />
                <Bar label="Grade 8" value={82} max={100} color="var(--amber)" />
                <Bar label="Grade 9" value={79} max={100} color="var(--coral)" />
              </div>

              <button className="ad-link-btn" onClick={() => navigate("/attendance")}>
                Full Attendance Report <ChevronRight size={14} />
              </button>
            </div>

            {/* Grade Distribution */}
            <div className="ad-card ad-grades-card">
              <div className="ad-card-header">
                <TrendingUp size={18} className="icon-purple" />
                <h2>Grade Distribution</h2>
                <span className="ad-card-badge purple">Term 2</span>
              </div>

              <div className="ad-grade-donut-wrap">
                <DonutChart percent={Math.round((GRADE_DIST[0].value + GRADE_DIST[1].value) / (GRADE_DIST.reduce((a, b) => a + b.value, 0)) * 100)} color="var(--teal)" size={88} />
                <div className="ad-att-donut-center">
                  <span className="ad-att-pct">
                    {Math.round((GRADE_DIST[0].value + GRADE_DIST[1].value) / (GRADE_DIST.reduce((a, b) => a + b.value, 0)) * 100)}%
                  </span>
                  <span className="ad-att-pct-label">A & B</span>
                </div>
              </div>

              <div className="ad-grade-bars">
                {GRADE_DIST.map(g => (
                  <Bar key={g.label} label={g.label} value={g.value} max={maxGrade} color={g.color} />
                ))}
              </div>

              <button className="ad-link-btn" onClick={() => navigate("/view-reports")}>
                Full Academic Report <ChevronRight size={14} />
              </button>
            </div>

            {/* Notices */}
            <div className="ad-card ad-notices-card">
              <div className="ad-card-header">
                <Bell size={18} className="icon-amber" />
                <h2>Notices</h2>
                <span className="ad-notices-count">{NOTICES.length}</span>
              </div>

              <div className="ad-notices-list">
                {NOTICES.map(n => (
                  <div key={n.id} className={`ad-notice-item ad-notice-${n.type}`}>
                    <div className="ad-notice-icon-wrap">
                      <n.icon size={13} />
                    </div>
                    <div className="ad-notice-body">
                      <p className="ad-notice-text">{n.text}</p>
                      <p className="ad-notice-time">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="ad-link-btn" onClick={() => navigate("/announcements")}>
                Manage Announcements <ChevronRight size={14} />
              </button>
            </div>

          </section>

          {/* ── Bottom Row ── */}
          <section className="ad-bottom-row">

            {/* Quick Actions */}
            <div className="ad-card ad-qa-card">
              <div className="ad-card-header">
                <LayoutGrid size={18} className="icon-teal" />
                <h2>Quick Actions</h2>
              </div>
              <div className="ad-qa-grid">
                {QUICK_ACTIONS.map((qa, i) => (
                  <button
                    key={i}
                    className={`ad-qa-btn qa-${qa.color}`}
                    onClick={() => navigate(qa.path)}
                  >
                    <div className="ad-qa-icon-wrap">
                      <qa.icon size={18} />
                    </div>
                    <span className="ad-qa-label">{qa.label}</span>
                    <ChevronRight size={13} className="ad-qa-arrow" />
                  </button>
                ))}
              </div>
            </div>

            {/* School Calendar */}
            <div className="ad-card ad-calendar-card">
              <div className="ad-card-header">
                <CalendarDays size={18} className="icon-teal" />
                <h2>School Calendar</h2>
                {loadingEvents && <span className="ad-loading-pill">Syncing…</span>}
              </div>

              <div className="ad-cal-wrap">
                <Calendar
                  onChange={handleDateClick}
                  value={selectedDate}
                  tileContent={({ date }) => {
                    const iso = date.toISOString().split("T")[0];
                    const ev  = events[iso];
                    if (!ev) return null;
                    return (
                      <span
                        className={`ad-event-dot ${ev.type === "holiday" ? "dot-holiday" : "dot-custom"}`}
                        title={ev.title}
                      />
                    );
                  }}
                />
              </div>

              <div className="ad-event-detail">
                <p className="ad-event-date-label">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
                {selectedEvent ? (
                  <div className="ad-event-info">
                    <span className={`ad-event-badge ${selectedEvent.type}`}>
                      {selectedEvent.type === "holiday" ? "🏖️ Holiday" : "📅 Event"}
                    </span>
                    <p className="ad-event-title">{selectedEvent.title}</p>
                    {selectedEvent.description && <p className="ad-event-desc">{selectedEvent.description}</p>}
                    <button className="ad-edit-event-btn" onClick={() => handleDateClick(selectedDate)}>
                      <FaEdit size={11} /> Edit Event
                    </button>
                  </div>
                ) : (
                  <div className="ad-no-event">
                    <p className="ad-event-none-text">No events on this day</p>
                    <button className="ad-add-event-btn" onClick={() => handleDateClick(selectedDate)}>
                      <FaPlus size={11} /> Add Event
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events strip */}
            <div className="ad-card ad-upcoming-card">
              <div className="ad-card-header">
                <CheckCheck size={18} className="icon-green" />
                <h2>Upcoming Events</h2>
              </div>
              <div className="ad-upcoming-list">
                {Object.entries(events)
                  .filter(([k]) => new Date(k) >= new Date(new Date().toDateString()))
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .slice(0, 5)
                  .map(([dateKey, ev]) => (
                    <div key={dateKey} className="ad-upcoming-item">
                      <div className={`ad-upcoming-badge ${ev.type === "holiday" ? "holiday" : "event"}`}>
                        {new Date(dateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="ad-upcoming-info">
                        <p className="ad-upcoming-title">{ev.title}</p>
                        <p className="ad-upcoming-type">{ev.type === "holiday" ? "School Holiday" : "Custom Event"}</p>
                      </div>
                    </div>
                  ))}
                {Object.keys(events).filter(k => new Date(k) >= new Date(new Date().toDateString())).length === 0 && (
                  <div className="ad-empty-upcoming">
                    <CalendarDays size={28} opacity={0.3} />
                    <p>No upcoming events.<br />Add some to the calendar.</p>
                  </div>
                )}
              </div>
            </div>

          </section>
        </main>
      </div>

      {/* ── Event Modal ── */}
      {showEventModal && (
        <div className="ad-modal-overlay" onClick={handleCloseModal}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>{editingEvent ? "Edit Event" : "Add New Event"}</h3>
              <button className="ad-modal-close" onClick={handleCloseModal}><FaTimes /></button>
            </div>

            <div className="ad-modal-body">
              <label className="ad-form-label">Event Type</label>
              <div className="ad-type-options">
                <button className={`ad-type-btn ${eventType === "holiday" ? "active" : ""}`} onClick={() => setEventType("holiday")}>🏖️ Holiday</button>
                <button className={`ad-type-btn ${eventType === "custom"  ? "active" : ""}`} onClick={() => setEventType("custom")}>📅 Custom Event</button>
              </div>

              {eventType === "custom" && (
                <div className="ad-form-group">
                  <label className="ad-form-label">Event Title <span className="req">*</span></label>
                  <input
                    className="ad-form-input"
                    placeholder="e.g., Staff meeting, Parent-Teacher Conference"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                  />
                </div>
              )}

              <div className="ad-form-group">
                <label className="ad-form-label">Description <span className="opt">(optional)</span></label>
                <textarea
                  className="ad-form-textarea"
                  placeholder="Add more details about this event…"
                  value={eventDescription}
                  onChange={e => setEventDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="ad-modal-date-display">
                <CalendarDays size={15} />
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>

            <div className="ad-modal-footer">
              {editingEvent && (
                <button className="ad-delete-btn" onClick={handleDeleteEvent}><FaTrash /> Delete</button>
              )}
              <div className="ad-modal-actions">
                <button className="ad-cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button className="ad-save-btn" onClick={handleSaveEvent}>
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;