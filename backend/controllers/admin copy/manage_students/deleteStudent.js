import Students from "../../../models/Student.model.js";

export const deleteStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const deletedStudent = await Students.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      return res.status(400).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};
