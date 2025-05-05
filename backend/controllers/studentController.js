// controllers/studentController.js

import Students from "../models/Student.model.js";
import School from "../models/School.model.js"; // ⬅️ Import the School model if not already
import Class from "../models/Class.model.js"; // or whatever your model file is named
import TermSession from "../models/TermSession.model.js";



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
    const schoolId = req.user?.schoolId || req.body.schoolId;
    if (!schoolId) return res.status(400).json({ message: "School ID is required" });

    const idno = await generateUniqueId();

    const studentData = {
      ...req.body,
      idno,
      schoolId, // ✅ attach the schoolId to the student
    };

    const newStudent = new Students(studentData);
    const savedStudent = await newStudent.save();

    await School.findByIdAndUpdate(
      schoolId,
      { $inc: { numberOfStudents: 1 } }
    );

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: "Error creating student", error });
  }
};



// Get all students
export const getAllStudents = async (req, res) => {
  const { schoolId } = req.user;

  try {
    const students = await Students.find({ schoolId }).populate("classes", "className");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};



// Get a single student by ID
export const getStudentById = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId;
    const student = await Students.findOne({ _id: req.params.id, schoolId });

    if (!student)
      return res.status(404).json({ message: "Student not found or unauthorized" });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error });
  }
};


// Update student
export const updateStudent = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || req.body.schoolId;
    const student = await Students.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      req.body,
      { new: true }
    );

    if (!student)
      return res.status(404).json({ message: "Student not found or unauthorized" });

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: "Error updating student", error });
  }
};

// Delete student
// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId;

    const deletedStudent = await Students.findOneAndDelete({
      _id: req.params.id,
      schoolId,
    });

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found or unauthorized" });
    }

    // ✅ Remove student from any class they are assigned to
    await Class.updateMany(
      { students: deletedStudent._id }, // Find all classes with the student
      { $pull: { students: deletedStudent._id } } // Remove them from the array
    );

    // ✅ Decrease student count
    await School.findByIdAndUpdate(
      schoolId,
      { $inc: { numberOfStudents: -1 } }
    );

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting student", error });
  }
};

// Search student by name or ID number (optional)
export const searchStudents = async (req, res) => {
  const { query } = req.query;
  const schoolId = req.user?.schoolId || req.query.schoolId;

  try {
    const students = await Students.find({
      schoolId,
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

export const getStudentsBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const students = await Students.find({ school: schoolId }).select("_id name");
    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch students by class
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await Students.find({ classes: classId });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students", error: err.message });
  }
};


export const markAttendance = async (req, res) => {
  const { studentId } = req.body;
  const today = new Date(); // live date
  const currentDay = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6

  // Disallow weekends
  if (currentDay === 0 || currentDay === 6) {
    return res.status(400).json({ message: "Attendance can only be marked Monday to Friday." });
  }

  try {
    const student = await Students.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch active term session for this student's school
    const currentTerm = await TermSession.findOne({
      schoolId: student.schoolId,
      startDate: { $lte: today },
      endDate: { $gte: today },
      isActive: true
    });

    if (!currentTerm) {
      return res.status(400).json({ message: "No active term found for this date." });
    }

    const year = currentTerm.yearLabel;
    const academicYear = student.academicRecords.find(rec => rec.yearLabel === year);
    if (!academicYear) {
      return res.status(400).json({ message: "Academic year not found in student record." });
    }

    const studentTerm = academicYear.terms.find(term => term.termName === currentTerm.termName);
    if (!studentTerm) {
      return res.status(400).json({ message: "Term record not found in student academic data." });
    }

    const currentWeek = Math.ceil((today.getDate()) / 7);
    let weekAttendance = studentTerm.attendance.find(a => a.week === currentWeek);

    if (!weekAttendance) {
      weekAttendance = { week: currentWeek, days: Array(5).fill(false) };
      studentTerm.attendance.push(weekAttendance);
    }

    const dayIndex = currentDay - 1; // Monday = 0, ..., Friday = 4
    weekAttendance.days[dayIndex] = true;

    student.markModified("academicRecords");
    await student.save();

    res.json({ message: "Attendance marked successfully for today." });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Failed to mark attendance", error: err.message });
  }
};

export const getAttendanceForToday = async (req, res) => {
  const { studentId } = req.params;
  const today = new Date();
  const currentDay = today.getDay();

  // Reject weekends
  if (currentDay === 0 || currentDay === 6) {
    return res.status(400).json({ message: "Today is a weekend. No attendance expected." });
  }

  try {
    const student = await Students.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const currentTerm = await TermSession.findOne({
      schoolId: student.schoolId,
      startDate: { $lte: today },
      endDate: { $gte: today },
      isActive: true,
    });

    if (!currentTerm) {
      return res.status(404).json({ message: "No active term found for today." });
    }

    const academicYear = student.academicRecords.find(
      (rec) => rec.yearLabel === currentTerm.yearLabel
    );
    if (!academicYear) {
      return res.status(400).json({ message: "Academic year not found in student record." });
    }

    const studentTerm = academicYear.terms.find(
      (term) => term.termName === currentTerm.termName
    );
    if (!studentTerm) {
      return res.status(400).json({ message: "Term record not found in student academic data." });
    }

    const currentWeek = Math.ceil(today.getDate() / 7);
    const weekAttendance = studentTerm.attendance.find((a) => a.week === currentWeek);

    const dayIndex = currentDay - 1; // Monday = 0, ..., Friday = 4
    const isPresent = weekAttendance?.days?.[dayIndex] || false;

    res.json({
      date: today.toISOString(),
      dayIndex,
      isPresent,
      termStartDate: currentTerm.startDate,
      termEndDate: currentTerm.endDate,
    });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
};