import Students from "../../../models/Student.model.js";

export const editStudent = async (req, res, next) => {
  try {
    const { id, ...reqBody } = req.body;
    const updatedStudent = await Students.findByIdAndUpdate(id, reqBody);

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    next(error);
  }
};
