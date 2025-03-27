import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "./Calendar.modules.css";
import toast from "react-hot-toast";

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const navigateToToday = useCallback(() => {
    setShowForm(false);
    const today = new Date();
    setDate(today);
    setSelectedDate(today);
    setView("month"); // Ensure we view the month to see today’s date
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleAddEvent = () => {
    if (selectedDate) {
      setShowForm(true);
    } else {
      toast.error("Please select a date first.");
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(newDate);
  };
  return (
    <div className="calendar-page">
      <div className="calendar-content">
        <main className="main-content">
          <div className="calendar-header">
            <h2 className="calendar-title">Calendar</h2>
          </div>
          <div className="calendar-main-content">
            <div className="calendar-sidebar">
              <button className="add-event-btn" onClick={handleAddEvent}>
                Add New Event
              </button>
              <div className="events-list">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <div key={index} className="event-item">
                      {event}
                    </div>
                  ))
                ) : (
                  <p>No events added</p>
                )}
              </div>
            </div>
            <div className="cal-content">
              <div className="all-buttons">
                <button
                  className="today-btn hidden lg:block"
                  onClick={navigateToToday}
                >
                  Today
                </button>
                <div className="view-buttons">
                  <button
                    className="today-btn lg:hidden"
                    onClick={navigateToToday}
                  >
                    Today
                  </button>
                  <button
                    className={view === "day" ? "active" : ""}
                    onClick={() => {
                      setShowForm(false);
                      setView("day");
                    }}
                  >
                    Day
                  </button>
                  <button
                    className={view === "week" ? "active" : ""}
                    onClick={() => {
                      setShowForm(false);
                      setView("week");
                    }}
                  >
                    Week
                  </button>
                  <button
                    className={view === "month" ? "active" : ""}
                    onClick={() => {
                      setShowForm(false);
                      setView("month");
                    }}
                  >
                    Month
                  </button>
                </div>
              </div>
              {!showForm && (
                <div className="calendar-container">
                  <Calendar
                    className="custom-calendar"
                    onChange={handleDateChange}
                    value={date}
                    view={view}
                    onViewChange={setView}
                  />
                </div>
              )}
              {showForm && (
                <form className="add-event-form">
                  <h2>Add New Event</h2>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="text"
                      value={selectedDate.toDateString()}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Event Name</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" />
                  </div>
                  <div className="form-group">
                    <label>Place</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea></textarea>
                  </div>
                  <div className="form-group">
                    <label>Upload Image</label>
                    <input type="file" accept="image/*" />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="save-button">
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
