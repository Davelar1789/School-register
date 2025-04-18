// controllers/teacherController.js
import Teacher from "../models/Teacher.model.js";
import School from "../models/School.model.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";


const generateToken = ({ id, fullName, role, schoolName, schoolId }) => {
  return jwt.sign({ id, fullName, role, schoolName, schoolId }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
};

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
    const { email } = req.body;

    if (!schoolId) return res.status(400).json({ message: "School ID is required" });

    // Check if email already exists in Teacher model
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email is already in use by a teacher" });
    }

    // Check if email already exists in User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use by a system user" });
    }

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


// Phase 1: Check email existence and usage
export const verifyTeacherEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(200).json({ usage: teacher.usage });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error });
  }
};

// Phase 2: First-time setup - verify staffId and set password
export const firstTimeSetup = async (req, res) => {
  const { email, staffId, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email, staffId }).populate("school", "name");

    if (!teacher || teacher.usage === "used") {
      return res.status(400).json({ message: "Invalid credentials or already used" });
    }

    teacher.password = password;
    teacher.usage = "used";
    await teacher.save();

    const token = generateToken({
      id: teacher._id,
      fullName: teacher.name,
      role: "Teacher",
      schoolName: teacher.school?.name || "",
      schoolId: teacher.school?._id || "",
    });

    res.status(200).json({
      message: "Password created successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        staffId: teacher.staffId,
        school: teacher.school,
        token,
      },
    });
  } catch (error) {
    console.error("Setup Error:", error);
    res.status(500).json({ message: "Error setting up teacher", error });
  }
};


// Phase 3: Normal login
export const loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email }).populate("school", "name");

    if (!teacher || teacher.usage !== "used") {
      return res.status(400).json({ message: "Invalid credentials or setup not complete" });
    }

    const isMatch = await teacher.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken({
      id: teacher._id,
      fullName: teacher.name,
      role: "Teacher",
      schoolName: teacher.school?.name || "",
      schoolId: teacher.school?._id || ""
    });

    res.status(200).json({
      message: "Login successful",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        staffId: teacher.staffId,
        school: teacher.school,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
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
