import Teachers from "../../../models/Teacher.model.js";
import { errorHandler } from "../../../utils/error.js";

export const getAllTeachers = async (req, res, next) => {
  try {
    const allTeachers = await Teachers.find().sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ data: allTeachers, message: "All Teachers fetched" });
  } catch (error) {
    next(error);
  }
};

export const getTeacherDetails = async (req, res, next) => {
  try {
    const { teacherId } = req.body;

    const teacherDetails = await Teachers.findById(teacherId);

    if (!teacherDetails) {
      return errorHandler(400, "Teacher Deleted");
    }

    return res
      .status(200)
      .json({ data: teacherDetails, message: "Teacher Details fetched" });
  } catch (error) {
    next(error);
  }
};
