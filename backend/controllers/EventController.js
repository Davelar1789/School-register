import Event from '../models/Event.model.js';
import School from '../models/School.model.js';

/* ======================================================
   CREATE EVENT (ADMIN / SUPERADMIN ONLY)
====================================================== */
export const createEvent = async (req, res) => {
  try {
    const { date, type, title, description, schoolId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role?.toLowerCase();

    // Role guard
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can create events' });
    }

    // Validate required fields
    if (!date || !type) {
      return res.status(400).json({ message: 'Date and type are required' });
    }

    if (!['holiday', 'custom'].includes(type)) {
      return res.status(400).json({
        message: 'Type must be either "holiday" or "custom"',
      });
    }

    if (type === 'custom' && !title) {
      return res.status(400).json({
        message: 'Title is required for custom events',
      });
    }

    // Resolve school (admin-owned)
    let school = schoolId;

    if (!school) {
      const userSchool = await School.findOne({ user: userId });
      if (!userSchool) {
        return res.status(404).json({ message: 'School not found' });
      }
      school = userSchool._id;
    }

    // Prevent duplicate active event on same date
    const existingEvent = await Event.findOne({
      school,
      date: new Date(date),
      isActive: true,
    });

    if (existingEvent) {
      return res.status(400).json({
        message: 'An event already exists for this date',
      });
    }

    const event = new Event({
      school,
      date: new Date(date),
      type,
      title: type === 'holiday' ? 'Holiday' : title,
      description: description || '',
      createdBy: userId,
      createdByModel: 'User', // ✅ admin only
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      message: 'Error creating event',
      error: error.message,
    });
  }
};

/* ======================================================
   GET ALL EVENTS FOR A SCHOOL (PUBLIC / AUTH)
====================================================== */
export const getSchoolEvents = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { school: schoolId, isActive: true };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      message: 'Events retrieved successfully',
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

/* ======================================================
   GET EVENTS FOR LOGGED-IN USER'S SCHOOL
   (ADMIN + TEACHER)
====================================================== */
export const getMySchoolEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userRole = req.user.role?.toLowerCase();

    let schoolId;

    if (userRole === 'admin' || userRole === 'superadmin') {
      const school = await School.findOne({ user: req.user._id });
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
      schoolId = school._id;
    } else if (userRole === 'teacher') {
      if (!req.user.school) {
        return res.status(404).json({
          message: 'Teacher has no school assigned',
        });
      }
      schoolId = req.user.school;
    } else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const query = { school: schoolId, isActive: true };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      message: 'Events retrieved successfully',
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

/* ======================================================
   GET EVENT BY ID
====================================================== */
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'fullName email')
      .populate('school', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({
      message: 'Event retrieved successfully',
      event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      message: 'Error fetching event',
      error: error.message,
    });
  }
};

/* ======================================================
   UPDATE EVENT (ADMIN / SUPERADMIN ONLY)
====================================================== */
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { date, type, title, description } = req.body;
    const userRole = req.user.role?.toLowerCase();

    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can update events' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (date) event.date = new Date(date);

    if (type) {
      if (!['holiday', 'custom'].includes(type)) {
        return res.status(400).json({
          message: 'Type must be either "holiday" or "custom"',
        });
      }
      event.type = type;
      event.title = type === 'holiday' ? 'Holiday' : event.title;
    }

    if (title && event.type === 'custom') event.title = title;
    if (description !== undefined) event.description = description;

    await event.save();

    res.status(200).json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      message: 'Error updating event',
      error: error.message,
    });
  }
};

/* ======================================================
   DELETE EVENT (SOFT DELETE — ADMIN ONLY)
====================================================== */
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userRole = req.user.role?.toLowerCase();

    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can delete events' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isActive = false;
    await event.save();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

/* ======================================================
   GET HOLIDAYS FOR A SCHOOL
====================================================== */
export const getHolidays = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query;

    const query = {
      school: schoolId,
      type: 'holiday',
      isActive: true,
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const holidays = await Event.find(query)
      .sort({ date: 1 })
      .select('date title description');

    res.status(200).json({
      message: 'Holidays retrieved successfully',
      holidays,
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      message: 'Error fetching holidays',
      error: error.message,
    });
  }
};
