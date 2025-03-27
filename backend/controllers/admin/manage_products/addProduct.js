import Teachers from "../../../models/Teacher.model.js";

export const addTeachers = async (req, res, next) => {
  try {
    const newTeacher = await Teachers.create({ ...req.body });

    return res.status(200).json({
      data: newTeacher,
      message: "New Teacher Added",
    });
  } catch (error) {
    next(error);
  }
};
