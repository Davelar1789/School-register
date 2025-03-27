import Event from "../../../models/Event.model.js";

// Add new event
export const createEvent = async (req, res) => {
  const { name, date, time, description } = req.body;
  try {
    const newEvent = new Event({ name, date, time, description });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: "Error creating event" });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Error fetching events" });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events, no date filtering
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
};


