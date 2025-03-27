import Teachers from "../../../models/Teacher.model.js";

export const deleteTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;

    const deletedTeacher = await Teachers.findByIdAndDelete(teacherId);

    if (!deletedTeacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    return res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    next(error);
  }
};
