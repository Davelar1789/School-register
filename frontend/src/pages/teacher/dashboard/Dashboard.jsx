import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import "react-calendar/dist/Calendar.css";
import "./TeacherDashboard.modules.css";
import {
  CalendarDays, ClipboardCheck, ClipboardList,
  BookOpenCheck, Megaphone, Zap, LogOut, GraduationCap, FileCheck2, ArrowRight
} from "lucide-react";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser]                     = useState({ fullName: "", role: "" });
  const [school, setSchool]                 = useState({ name: "" });
  const [teacherType, setTeacherType]       = useState("");
  const [classCount, setClassCount]         = useState(0);
  const [selectedDate, setSelectedDate]     = useState(new Date());
  const [events, setEvents]                 = useState({});
  const [loadingEvents, setLoadingEvents]   = useState(false);

  const attendanceStatus = {
    total:  classCount,
    marked: 0,
  };

  /* ── Auth + decode token ── */
  useEffect(() => {
    const token       = localStorage.getItem("token");
    const teacherData = JSON.parse(localStorage.getItem("teacher"));

    if (!token || !teacherData) {
      toast.error("Please login first.");
      navigate("/sign-in");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      setUser({
        fullName: decoded.fullName,
        role:     decoded.role,
      });

      setSchool({ name: decoded.schoolName });
      setTeacherType(teacherData.teacherType || "");
    } catch (error) {
      toast.error("Session expired. Please log in again.");
      navigate("/sign-in");
    }
  }, [navigate]);

  /* ── Fetch classes ── */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/teachers/teacher/teacher-classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClassCount(res.data.count);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  /* ── Fetch events ── */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/api/events/my-school", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventsObj = {};
        res.data.events.forEach((event) => {
          const dateKey = new Date(event.date).toISOString().split("T")[0];
          eventsObj[dateKey] = {
            id:          event._id,
            type:        event.type,
            title:       event.title,
            description: event.description,
          };
        });
        setEvents(eventsObj);
      } catch (err) {
        console.error("Error fetching events:", err);
        toast.error("Failed to load calendar events");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  /* ── Logout ── */
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/teacher-login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const formattedDate  = selectedDate.toISOString().split("T")[0];
  const selectedEvent  = events[formattedDate];
  const attendancePct  = attendanceStatus.total > 0
    ? Math.round((attendanceStatus.marked / attendanceStatus.total) * 100)
    : 0;

  const quickActions = [
    { label: "Mark Attendance", icon: <ClipboardCheck size={22} />, to: "/attendance", color: "qa-teal"   },
    { label: "Gradebook",       icon: <BookOpenCheck  size={22} />, to: "/gradebook",  color: "qa-amber"  },
  ];

  return (
    <div className="td-page">

      {/* ══════════════════════════════════
          DASHBOARD HEADER
      ══════════════════════════════════ */}
      <header className="td-header">
        <div className="td-header-brand">
          <div className="td-header-logo">
            <GraduationCap size={22} />
          </div>
          <div className="td-header-school">
            <span className="td-header-school-name">
              {school.name || "School Name"}
            </span>
            <span className="td-header-school-sub">School Management</span>
          </div>
        </div>

        <div className="td-header-right">
          <div className="td-header-user">
            <div className="td-header-avatar">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="td-header-user-info">
              <span className="td-header-user-name">{user.fullName || "Teacher"}</span>
              <span className="td-header-user-role">{teacherType || user.role || "Teacher"}</span>
            </div>
          </div>

          <button className="td-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="td-banner">
        <div className="td-banner-left">
          <span className="td-banner-icon">
            <FileCheck2 size={20} />
          </span>
          <div className="td-banner-text">
            <p className="td-banner-title">End of Term Marking Schemes Available</p>
            <p className="td-banner-sub">
              View and download the official marking schemes for this term's exams.
            </p>
          </div>
        </div>
        <Link to="/marking-schemes" className="td-banner-btn">
          View Marking Schemes <ArrowRight size={16} />
        </Link>
      </div>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <main className="td-main">

        {/* ── Welcome ── */}
        <div className="td-welcome">
          <div>
            <h1 className="td-welcome-title">
              Welcome Back, {user.fullName?.split(" ")[0] || "Teacher"} 👋
            </h1>
            <p className="td-welcome-sub">Here's what's happening with your classes today.</p>
          </div>
          <div className="td-date-pill">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </div>
        </div>

        {/* ── Top row: Attendance + Quick Actions ── */}
        <div className="td-top-row">

          {/* Attendance */}
          <div className="td-card td-attendance">
            <div className="td-card-header">
              <ClipboardList size={20} className="td-card-icon icon-teal" />
              <h2>Attendance Status</h2>
            </div>
            <p className="td-att-label">
              <span className="td-att-marked">{attendanceStatus.marked}</span>
              <span className="td-att-sep"> of </span>
              <span className="td-att-total">{attendanceStatus.total}</span>
              <span className="td-att-sep"> classes marked today</span>
            </p>
            <div className="td-progress-track">
              <div className="td-progress-fill" style={{ width: `${attendancePct}%` }} />
            </div>
            <p className="td-att-hint">
              {attendanceStatus.marked === attendanceStatus.total && attendanceStatus.total > 0
                ? "✅ All classes marked — great work!"
                : attendanceStatus.marked === 0
                ? "No classes marked yet today."
                : `${attendanceStatus.total - attendanceStatus.marked} class(es) still need marking.`}
            </p>
            <Link to="/attendance" className="td-att-link">Go to Attendance →</Link>
          </div>

          {/* Quick Actions */}
          <div className="td-card td-quick-actions">
            <div className="td-card-header">
              <Zap size={20} className="td-card-icon icon-amber" />
              <h2>Quick Actions</h2>
            </div>
            <div className="td-qa-grid">
              {quickActions.map((a, i) => (
                <Link key={i} to={a.to} className={`td-qa-btn ${a.color}`}>
                  <span className="td-qa-icon">{a.icon}</span>
                  <span className="td-qa-label">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Agenda + Calendar + Announcements ── */}
        <div className="td-bottom-row">

          {/* Agenda */}
          <div className="td-card td-agenda">
            <div className="td-card-header">
              <CalendarDays size={20} className="td-card-icon icon-purple" />
              <h2>Agenda for Today</h2>
            </div>
            <div className="td-empty-state">
              <span className="td-empty-icon">📋</span>
              <p>Nothing here yet.</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="td-card td-calendar">
            <div className="td-card-header">
              <CalendarDays size={20} className="td-card-icon icon-teal" />
              <h2>School Calendar</h2>
              {loadingEvents && <span className="td-loading-pill">Loading…</span>}
            </div>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={({ date }) => {
                const iso   = date.toISOString().split("T")[0];
                const event = events[iso];
                return event ? (
                  <span
                    className={`td-event-dot ${event.type === "holiday" ? "dot-holiday" : "dot-custom"}`}
                    title={event.title}
                  />
                ) : null;
              }}
            />
            <div className="td-event-detail">
              <p className="td-event-date">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                })}
              </p>
              {selectedEvent ? (
                <div className="td-event-info">
                  <span className={`td-event-badge ${selectedEvent.type}`}>
                    {selectedEvent.type === "holiday" ? "🏖️ Holiday" : "📅 Event"}
                  </span>
                  {selectedEvent.description && (
                    <p className="td-event-desc">{selectedEvent.description}</p>
                  )}
                </div>
              ) : (
                <p className="td-event-none">No events scheduled for this day.</p>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="td-card td-announcements">
            <div className="td-card-header">
              <Megaphone size={20} className="td-card-icon icon-coral" />
              <h2>Announcements</h2>
            </div>
            <div className="td-empty-state">
              <span className="td-empty-icon">📢</span>
              <p>No announcements yet.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;