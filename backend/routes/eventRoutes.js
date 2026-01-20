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
router.use(protect);

router.post('/', createEvent);
router.get('/my-school', getMySchoolEvents);
router.get('/school/:schoolId', getSchoolEvents);
router.get('/school/:schoolId/holidays', getHolidays);
router.get('/:eventId', getEventById);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);

export default router;
