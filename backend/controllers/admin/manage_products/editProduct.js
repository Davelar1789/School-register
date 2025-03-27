import Teachers from "../../../models/Teacher.model.js";

export const editTeacher = async (req, res, next) => {
  try {
    const { id, ...reqBody } = req.body;
    const updatedTeacher = await Teachers.findByIdAndUpdate(id, reqBody);

    if (!updatedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({ message: "Teacher updated successfully" });
  } catch (error) {
    next(error);
  }
};
