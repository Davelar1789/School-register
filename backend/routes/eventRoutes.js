import express from 'express';
import {
  createEvent,
  getSchoolEvents,
  getMySchoolEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getHolidays
} from '../controllers/EventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication

router.post('/', protect, createEvent);
router.get('/my-school', protect, getMySchoolEvents);
router.get('/school/:schoolId', protect, getSchoolEvents);
router.get('/school/:schoolId/holidays', protect, getHolidays);
router.get('/:eventId', protect, getEventById);
router.put('/:eventId', protect, updateEvent);
router.delete('/:eventId', protect, deleteEvent);

export default router;
