import Students from "../../../models/Student.model.js";

export const editStudent = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body);
    const { id, ...reqBody } = req.body;
    console.log("ID:", id);
    console.log("Updated Student Details:", reqBody);

    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }

    const updatedStudent = await Students.findByIdAndUpdate(id, reqBody, { new: true });
    console.log("Updated Student:", updatedStudent);

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student updated successfully", data: updatedStudent });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};
