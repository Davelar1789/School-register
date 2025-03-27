import Assignment from '../../models/assignment.js';

export const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, submission } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    assignment.submissions.push({ studentId: req.user.id, submission });
    await assignment.save();
    res.status(200).json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    next(error);
  }
};
