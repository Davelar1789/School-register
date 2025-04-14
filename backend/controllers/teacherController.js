// controllers/teacherController.js
import Teacher from "../models/Teacher.model.js";
import School from "../models/School.model.js";

// Generate unique staff ID
const generateStaffId = async () => {
  let idExists = true;
  let staffId;

  while (idExists) {
    staffId = 'T' + Math.floor(100000 + Math.random() * 900000); // T123456
    const existing = await Teacher.findOne({ staffId });
    idExists = !!existing;
  }

  return staffId;
};

// Create teacher
export const createTeacher = async (req, res) => {
  try {
    const schoolId = req.body.schoolId || req.user?.schoolId;
    if (!schoolId) return res.status(400).json({ message: "School ID is required" });

    const staffId = await generateStaffId();

    const newTeacher = new Teacher({
      ...req.body,
      staffId,
      school: schoolId,
    });

    const savedTeacher = await newTeacher.save();

    // Optionally update school teacher count
    await School.findByIdAndUpdate(schoolId, {
      $inc: { numberOfTeachers: 1 },
    });

    res.status(201).json(savedTeacher);
  } catch (error) {
    res.status(500).json({ message: "Error creating teacher", error });
  }
};

// Get all teachers for a school
export const getTeachersBySchool = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;
    const teachers = await Teacher.find({ school: schoolId }).sort({ createdAt: -1 });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers", error });
  }
};

// Get single teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teacher", error });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating teacher", error });
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Optionally decrement teacher count
    await School.findByIdAndUpdate(teacher.school, {
      $inc: { numberOfTeachers: -1 },
    });

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher", error });
  }
};
