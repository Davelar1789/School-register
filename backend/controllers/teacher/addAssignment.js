import Assignment from '../../models/assignment.js';

export const addAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;
    const assignment = new Assignment({ title, description, dueDate, teacherId: req.user.id });
    await assignment.save();
    res.status(201).json({ message: 'Assignment added successfully' });
  } catch (error) {
    next(error);
  }
};
