import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import Header from "../../../components/Teacher/TeacherHeader";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "react-calendar/dist/Calendar.css";
import "./TeacherDashboard.modules.css";
import { BookOpen, ClipboardList, CalendarDays, TrendingUp } from "lucide-react";

const TeacherDashboard = () => {
  const [classCount, setClassCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loadingEvents, setLoadingEvents] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/teachers/teacher/teacher-classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClassCount(response.data.count);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const token = localStorage.getItem("token");

        const response = await api.get("/api/events/my-school", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const eventsObj = {};
        response.data.events.forEach((event) => {
          const dateKey = new Date(event.date).toISOString().split("T")[0];
          eventsObj[dateKey] = {
            id: event._id,
            type: event.type,
            title: event.title,
            description: event.description,
          };
        });

        setEvents(eventsObj);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load calendar events");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const selectedEvent = events[formattedDate];

  const stats = [
    { icon: BookOpen, label: "Total Classes", value: classCount, gradient: "blue-gradient" },
    { icon: ClipboardList, label: "Assignments Due", value: 0, gradient: "purple-gradient" },
  ];

  const recentActivities = [
    { action: "Graded Math Quiz", class: "Basic 4A", time: "2 hours ago" },
    { action: "Posted New Assignment", class: "Basic 5B", time: "5 hours ago" },
    { action: "Responded to Parent Query", class: "Basic 3C", time: "Yesterday" },
  ];

  return (
    <div className="teacher-dashboard2">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main2">
          <div className="welcome-section">
            <h1 className="dashboard-title">Welcome Back, Teacher 👋</h1>
            <p className="dashboard-subtitle">Here's what's happening with your classes today</p>
          </div>

          <div className="dashboard-widgets">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="widget-card">
                  <div className="widget-header">
                    <div className={`widget-icon ${stat.gradient}`}>
                      <Icon size={24} />
                    </div>
                    <TrendingUp size={18} className="trend-icon" />
                  </div>
                  <h3>{stat.label}</h3>
                  <p>{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="dashboard-grid">
            <div className="calendar-section">
              <div className="section-header">
                <CalendarDays size={22} className="section-icon" />
                <h2>School Calendar</h2>
                {loadingEvents && <span className="loading-text">Loading...</span>}
              </div>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={({ date }) => {
                  const iso = date.toISOString().split("T")[0];
                  const event = events[iso];
                  if (event) {
                    return (
                      <span
                        className={`event-dot ${event.type === "holiday" ? "holiday-dot" : "custom-dot"}`}
                        title={event.title}
                      ></span>
                    );
                  }
                  return null;
                }}
              />
              <div className="event-details">
                <p className="event-date">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {selectedEvent ? (
                  <div className="event-info-teacher">
                    <div className={`event-type-badge-teacher ${selectedEvent.type}`}>
                      {selectedEvent.type === "holiday" ? "🏖️ Holiday" : "📅 Event"}
                    </div>
                    {selectedEvent.description && (
                      <p className="event-description">{selectedEvent.description}</p>
                    )}
                  </div>
                ) : (
                  <p className="event-description">No events scheduled for this day.</p>
                )}
              </div>
            </div>

            {/* <div className="activity-section">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <p className="activity-action">{activity.action}</p>
                    <div className="activity-meta">
                      <span className="activity-class">{activity.class}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-btn">View All Activities</button>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;