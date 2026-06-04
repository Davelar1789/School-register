import express from 'express';

const router = express.Router();

// In your events router
router.get('/internal/:schoolId', async (req, res) => {
  const apiKey = req.headers['x-bot-api-key'];
  if (apiKey !== process.env.BOT_API_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

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

    res.status(200).json({ message: 'Events retrieved successfully', events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

export default router;
