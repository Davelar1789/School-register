import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import Header from "../../../components/Teacher/TeacherHeader";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import api from "../../../api/axios";
import "react-calendar/dist/Calendar.css";
import "./TeacherDashboard.modules.css";
import { BookOpen, Mail, ClipboardList, CalendarDays, TrendingUp, Users } from "lucide-react";

const TeacherDashboard = () => {
  const [classCount, setClassCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = {
    "2025-01-15": "Prepare class notes for Basic 2",
    "2025-01-16": "Staff meeting at 10:00am",
    "2025-01-20": "Parent-Teacher Conference",
    "2025-01-22": "Mid-term Assessment Review",
  };

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
      } catch (error) {}
    };

    fetchClasses();
  }, []);

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const selectedEvent = events[formattedDate];

  const stats = [
    { icon: BookOpen, label: "Total Classes", value: classCount, gradient: "blue-gradient" },
    { icon: ClipboardList, label: "Assignments Due", value: 0, gradient: "purple-gradient" },
    { icon: Mail, label: "Messages", value: 0, gradient: "green-gradient" },
    { icon: Users, label: "Total Students", value: 156, gradient: "orange-gradient" },
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
            <h1 className="dashboard-title">Welcome Back, Teacher! 👋</h1>
            <p className="dashboard-subtitle">Here's what's happening with your classes today</p>
          </div>

          <div className="dashboard-widgets">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="widget-card">
                  <div className="widget-header">
                    <div className={`widget-icon ${stat.gradient}`}>
                      <Icon size={28} color="white" />
                    </div>
                    <TrendingUp size={20} className="trend-icon" />
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
                <CalendarDays size={24} className="section-icon" />
                <h2>Calendar</h2>
              </div>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={({ date }) => {
                  const iso = date.toISOString().split("T")[0];
                  return events[iso] ? <span className="event-dot"></span> : null;
                }}
              />
              <div className="event-details">
                <p className="event-date">
                  {selectedDate.toLocaleDateString("en-US", { 
                    weekday: "long", 
                    month: "long", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </p>
                <p className="event-description">
                  {selectedEvent || "No events scheduled for this day"}
                </p>
              </div>
            </div>

            <div className="activity-section">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;