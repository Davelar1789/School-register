import React, { useState } from "react";
import axios from '../../../api/axios';
import { toast } from "react-hot-toast"; // Import react-hot-toast
import styles from "./Events.module.css"; // Import the CSS module

const Events = () => {
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
  });

  const [events, setEvents] = useState([]);

  const handleInputChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("/api/events", eventData);
      setEvents([...events, response.data]);
      setEventData({ name: "", date: "", time: "", description: "" });
      toast.success("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error.response?.data || error.message);
      toast.error("Failed to add event! Check console for details.");
    }
  };
  
  return (
    <div className={styles.eventsPage}>
      <h2 className={styles.title}>Manage Events</h2>
      <form className={styles.eventForm} onSubmit={handleAddEvent}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Event Name</label>
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            placeholder="Enter event name"
            required
          />
        </div>

        <div className={styles.formGroup}>
  <label htmlFor="date">Event Date</label>
  <input
    type="text"
    name="date"
    value={eventData.date}
    onChange={handleInputChange}
    placeholder="Enter event date"
    required
  />
</div>


        <div className={styles.formGroup}>
          <label htmlFor="time">Event Time</label>
          <input
            type="time"
            name="time"
            value={eventData.time}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            placeholder="Enter event description"
            required
          ></textarea>
        </div>

        <button type="submit" className={styles.addButton}>
          Add Event
        </button>
      </form>

      {/* Display Events */}
      <div className={styles.eventsList}>
        <h3>Upcoming Events</h3>
        {events.length === 0 ? (
          <p>No events added yet.</p>
        ) : (
          events.map((event, index) => (
            <div key={index} className={styles.eventCard}>
              <h4>{event.name}</h4>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p> {/* Convert to readable format */}
              <p>Time: {event.time}</p>
              <p>Description: {event.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
