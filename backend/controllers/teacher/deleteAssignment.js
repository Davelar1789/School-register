import Assignment from '../../models/assignment.js';

export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await assignment.remove();
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
