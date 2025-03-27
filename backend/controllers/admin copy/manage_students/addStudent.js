import Students from "../../../models/Student.model.js";

export const addStudents = async (req, res, next) => {
  try {
    const newStudent = await Students.create({ ...req.body });

    return res.status(200).json({
      data: newStudent,
      message: "New Student Added",
    });
  } catch (error) {
    next(error);
  }
};
