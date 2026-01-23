import React, { useState, useEffect } from "react";
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
  FaTrash
} from "react-icons/fa";
import "./Dashboard.modules.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType, setEventType] = useState('custom');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Please login first.");
        navigate("/sign-in");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      await fetchSchool(parsedUser._id);
      await fetchEvents();
      setLoading(false);
    };

    initializeDashboard();
  }, [navigate]);

  const fetchSchool = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        const schoolData = response.data.school || response.data;
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
      toast.error("Failed to load school data");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem("token");
      const response = await api.get('/api/events/my-school', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Convert events array to object with dates as keys
      const eventsObj = {};
      response.data.events.forEach(event => {
        const dateKey = new Date(event.date).toISOString().split('T')[0];
        eventsObj[dateKey] = {
          id: event._id,
          type: event.type,
          title: event.title,
          description: event.description
        };
      });

      setEvents(eventsObj);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    const existingEvent = events[formattedDate];
    
    if (existingEvent) {
      // If event exists, show it in edit mode
      setEditingEvent(existingEvent);
      setEventType(existingEvent.type);
      setEventTitle(existingEvent.title === 'Holiday' ? '' : existingEvent.title);
      setEventDescription(existingEvent.description || '');
    } else {
      // If no event, prepare for creating new one
      setEditingEvent(null);
      setEventType('custom');
      setEventTitle('');
      setEventDescription('');
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const formattedDate = selectedDate.toISOString().split('T')[0];

      if (eventType === 'custom' && !eventTitle.trim()) {
        toast.error("Please enter an event title");
        return;
      }

      const eventData = {
        date: formattedDate,
        type: eventType,
        title: eventType === 'holiday' ? 'Holiday' : eventTitle,
        description: eventDescription
      };

      if (editingEvent) {
        // Update existing event
        await api.put(`/api/events/${editingEvent.id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Event updated successfully");
      } else {
        // Create new event
        await api.post('/api/events', eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Event created successfully");
      }

      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(error.response?.data?.message || "Failed to save event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/events/${editingEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Event deleted successfully");
      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEventType('custom');
    setEventTitle('');
    setEventDescription('');
    setEditingEvent(null);
  };

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const selectedEvent = events[formattedDate];

  const statsCards = [
    {
      id: 1,
      title: "Total Students",
      value: schoolStats.numberOfStudents,
      icon: FaUserGraduate,
      colorClass: "stat-card-blue"
    },
    {
      id: 2,
      title: "Total Teachers",
      value: schoolStats.numberOfTeachers,
      icon: FaChalkboardTeacher,
      colorClass: "stat-card-pink"
    },
    {
      id: 3,
      title: "Active Classes",
      value: schoolStats.numberOfClasses,
      icon: FaUsers,
      colorClass: "stat-card-orange"
    }
  ];

  const quickLinks = [
    { label: "Manage Students", path: "/students" },
    { label: "Manage Teachers", path: "/teachers" },
    { label: "View Reports", path: "/view-reports" },
    { label: "School Settings", path: "/settings" }
  ];

  if (!user || loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="loading-spinner" />
        {/* <p className="loading-text">Loading dashboard...</p> */}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header2 />
        
        <main className="dashboard-content">
          <div className="dashboard-wrapper">
            
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back! 👋</h1>
              <p className="welcome-subtitle">
                Here's what's happening with your school today
              </p>
            </div>

            <div className="stats-grid">
              {statsCards.map((card) => (
                <div key={card.id} className={`stat-card ${card.colorClass}`}>
                  <div className="stat-card-bg"></div>
                  
                  <div className="stat-card-content">
                    <div className="stat-icon-wrapper">
                      <card.icon className="stat-icon" />
                    </div>

                    <div className="stat-value">
                      {card.value.toLocaleString()}
                    </div>

                    <p className="stat-label">{card.title}</p>

                    <div className="stat-trend">
                      <span className="stat-trend-value">+12%</span>
                      <span className="stat-trend-label">vs last month</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-links-section">
              <div className="section-header">
                <h2 className="section-title">Quick Actions</h2>
                <div className="section-divider"></div>
              </div>

              <div className="quick-links-grid">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="quick-link-button"
                  >
                    <span className="quick-link-shine"></span>
                    <span className="quick-link-text">{link.label}</span>
                    <FaArrowRight className="quick-link-arrow" />
                  </button>
                ))}
              </div>
            </div>

            <div className="recent-activity-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">New student registered</p>
                    <p className="activity-time">2 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">Teacher submitted report</p>
                    <p className="activity-time">5 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">Class schedule updated</p>
                    <p className="activity-time">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="calendar-section">
              <div className="section-header">
                <CalendarDays size={24} className="section-icon" />
                <h2>School Calendar</h2>
                {loadingEvents && <FaSpinner className="loading-spinner-small" />}
              </div>
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileContent={({ date }) => {
                  const iso = date.toISOString().split("T")[0];
                  const event = events[iso];
                  if (event) {
                    return (
                      <span 
                        className={`event-dot ${event.type === 'holiday' ? 'holiday-dot' : 'custom-dot'}`}
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
                    year: "numeric" 
                  })}
                </p>
                {selectedEvent ? (
                  <div className="event-info">
                    <div className={`event-type-badge ${selectedEvent.type}`}>
                      {selectedEvent.type === 'holiday' ? '🏖️ Holiday' : '📅 Event'}
                    </div>
                    <p className="event-title">{selectedEvent.title}</p>
                    {selectedEvent.description && (
                      <p className="event-description">{selectedEvent.description}</p>
                    )}
                    <button 
                      className="edit-event-btn"
                      onClick={() => handleDateClick(selectedDate)}
                    >
                      <FaEdit /> Edit Event
                    </button>
                  </div>
                ) : (
                  <div className="no-event">
                    <p className="event-description">No events scheduled for this day</p>
                    <button 
                      className="add-event-btn"
                      onClick={() => handleDateClick(selectedDate)}
                    >
                      <FaPlus /> Add Event
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="event-modal-overlay" onClick={handleCloseModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="event-modal-body">
              <div className="form-group">
                <label>Event Type</label>
                <div className="event-type-options">
                  <button
                    className={`type-option ${eventType === 'holiday' ? 'active' : ''}`}
                    onClick={() => setEventType('holiday')}
                  >
                    🏖️ Holiday
                  </button>
                  <button
                    className={`type-option ${eventType === 'custom' ? 'active' : ''}`}
                    onClick={() => setEventType('custom')}
                  >
                    📅 Custom Event
                  </button>
                </div>
              </div>

              {eventType === 'custom' && (
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    className="event-input"
                    placeholder="e.g., Staff meeting, Parent-Teacher Conference"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  className="event-textarea"
                  placeholder="Add more details about this event..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="event-date-display">
                <CalendarDays size={18} />
                <span>
                  {selectedDate.toLocaleDateString("en-US", { 
                    weekday: "long", 
                    month: "long", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </span>
              </div>
            </div>

            <div className="event-modal-footer">
              {editingEvent && (
                <button 
                  className="delete-event-modal-btn"
                  onClick={handleDeleteEvent}
                >
                  <FaTrash /> Delete
                </button>
              )}
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button 
                  className="save-event-btn"
                  onClick={handleSaveEvent}
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
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