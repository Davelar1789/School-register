import express from "express";
import { createEvent, getAllEvents, getUpcomingEvents } from "../../controllers/general/events/eventController.js"; // Import the new controller function

const router = express.Router();

// Create a new event
router.post("/events", createEvent);

// Get all events
router.get("/events", getAllEvents);

// Get upcoming events (refactored to use controller)
router.get("/upcoming-events", getUpcomingEvents);

export default router;
