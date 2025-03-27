import Assignment from '../../models/assignment.js';

export const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ studentId: req.user.id });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};
