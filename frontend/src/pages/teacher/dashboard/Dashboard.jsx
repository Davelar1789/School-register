import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import Header from "../../../components/Teacher/TeacherHeader";
import Sidebar from "../../../components/Teacher/TeacherSidebar";
import api from "../../../api/axios";
import "react-calendar/dist/Calendar.css";
import "./TeacherDashboard.modules.css";

const TeacherDashboard = () => {
  const [classCount, setClassCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = {
    "2025-05-15": "Prepare class notes for Basic 2",
    "2025-05-16": "Staff meeting at 10:00am",
    "2025-06-06": "Eid-ul-Adha",
    "2025-06-11": "BECE Begins",
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

  return (
    <div className="teacher-dashboard2">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main2">
          <h1 className="dashboard-title">Welcome, Teacher!</h1>
          <p className="dashboard-subtitle">Here’s your activity overview</p>

          <div className="dashboard-widgets">
            <div className="widget-card">
              <h3>Total Classes</h3>
              <p>{classCount}</p>
            </div>
            <div className="widget-card">
              <h3>Assignments Due</h3>
              <p>0</p>
            </div>
            <div className="widget-card">
              <h3>Messages</h3>
              <p>0</p>
            </div>
          </div>

          {/* 🔥 Calendar Section */}
          <div className="calendar-section">
                  <h2 className="calendar-header">📅 Calendar</h2>
              <p className="calendar-subtext">Your upcoming events</p>
            <div className="calendar-box">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={({ date }) => {
                  const iso = date.toISOString().split("T")[0];
                  return events[iso] ? <span className="dot"></span> : null;
                }}
              />
            </div>
            <div className="event-details">
              <h3>{selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
              <p>{selectedEvent ? selectedEvent : "No events scheduled for this day"}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
