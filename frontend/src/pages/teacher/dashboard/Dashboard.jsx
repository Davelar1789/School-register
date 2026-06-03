import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import Header from "../../../components/Teacher/TeacherHeader";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "react-calendar/dist/Calendar.css";
import "./TeacherDashboard.modules.css";
import {
  CalendarDays, ClipboardCheck, ClipboardList,
  BookOpenCheck, Megaphone, Zap
} from "lucide-react";

const TeacherDashboard = () => {
  const [classCount, setClassCount]         = useState(0);
  const [selectedDate, setSelectedDate]     = useState(new Date());
  const [events, setEvents]                 = useState({});
  const [loadingEvents, setLoadingEvents]   = useState(false);

  // Attendance status — replace with real data when API is ready
  const attendanceStatus = {
    total:  classCount,
    marked: 0,
  };

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
            id: event._id,
            type: event.type,
            title: event.title,
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
      {/* <Header /> */}
      <div className="td-body">
        {/* <Sidebar /> */}

        <main className="td-main">

          {/* ── Welcome ── */}
          <div className="td-welcome">
            <div>
              <h1 className="td-welcome-title">Welcome Back, Teacher 👋</h1>
              <p className="td-welcome-sub">Here's what's happening with your classes today.</p>
            </div>
            <div className="td-date-pill">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* ── Top row: Attendance + Quick Actions ── */}
          <div className="td-top-row">

            {/* Attendance Status */}
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
                <div
                  className="td-progress-fill"
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              <p className="td-att-hint">
                {attendanceStatus.marked === attendanceStatus.total && attendanceStatus.total > 0
                  ? "✅ All classes marked — great work!"
                  : attendanceStatus.marked === 0
                  ? "No classes marked yet today."
                  : `${attendanceStatus.total - attendanceStatus.marked} class(es) still need marking.`
                }
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
    </div>
  );
};

export default TeacherDashboard;