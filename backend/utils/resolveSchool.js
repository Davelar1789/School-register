// utils/resolveSchool.js
import School from '../models/School.model.js';
import Teacher from '../models/Teacher.model.js';

export const resolveSchoolFromUser = async (user) => {
  // Case 1: School owner (User)
  const ownedSchool = await School.findOne({ user: user._id });
  if (ownedSchool) return ownedSchool;

  // Case 2: Teacher
  const teacher = await Teacher.findOne({ user: user._id }).populate('school');
  if (teacher && teacher.school) return teacher.school;

  return null;
};
