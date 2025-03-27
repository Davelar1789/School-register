import Assignment from '../../models/assignment.js';

export const editAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    await assignment.save();
    res.status(200).json({ message: 'Assignment updated successfully' });
  } catch (error) {
    next(error);
  }
};
