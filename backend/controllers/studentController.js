// controllers/studentController.js

import Students from "../models/Student.model.js";
import School from "../models/School.model.js"; // ⬅️ Import the School model if not already


const generateUniqueId = async () => {
  let idExists = true;
  let newId;

  while (idExists) {
    newId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const existingStudent = await Students.findOne({ idno: newId });
    idExists = !!existingStudent;
  }

  return newId;
};

export const createStudent = async (req, res) => {
  try {
    const idno = await generateUniqueId();

    const studentData = {
      ...req.body,
      idno,
    };

    const newStudent = new Students(studentData);
    const savedStudent = await newStudent.save();

    // ✅ STEP 1: Find the school associated with this student
    // You may pass schoolId in req.body, or find it via req.user.schoolId if user is logged in
    const schoolId = req.body.schoolId || req.user?.schoolId;

    if (schoolId) {
      // ✅ STEP 2: Increment the numberOfStudents in that school
      await School.findByIdAndUpdate(
        schoolId,
        { $inc: { numberOfStudents: 1 } }
      );
    }

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: "Error creating student", error });
  }
};


// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Students.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

// Get a single student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Students.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Students.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStudent)
      return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: "Error updating student", error });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Students.findByIdAndDelete(req.params.id);
    if (!deletedStudent)
      return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error });
  }
};

// Search student by name or ID number (optional)
export const searchStudents = async (req, res) => {
  const { query } = req.query;
  try {
    const students = await Students.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { idno: { $regex: query, $options: "i" } },
      ],
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error searching students", error });
  }
};
