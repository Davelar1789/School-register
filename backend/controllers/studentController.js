// controllers/studentController.js

import Students from "../models/Student.model.js";
import School from "../models/School.model.js"; // ⬅️ Import the School model if not already
import Class from "../models/Class.model.js"; // or whatever your model file is named



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

// Mark attendance
export const markAttendance = async (req, res) => {
  console.log("Marking attendance...");
  console.log("Request body:", req.body);

  const { studentId, date, present } = req.body;
  console.log("Extracted studentId:", studentId);
  console.log("Extracted date:", date);
  console.log("Extracted present:", present);

  try {
    console.log("Finding student by ID...");
    const student = await Students.findById(studentId);
    console.log("Student found:", student);

    if (!student) {
      console.log("Student not found. Returning 404...");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Calculating academic year...");
    const year = new Date(date).getFullYear();
    console.log("Year:", year);
    const academicYear = student.academicRecords.find((rec) => rec.yearLabel.includes(year.toString()));
    console.log("Academic year found:", academicYear);

    if (!academicYear) {
      console.log("Academic year not found. Returning 400...");
      return res.status(400).json({ message: "Academic year not found" });
    }

    console.log("Getting current term...");
    const currentTerm = academicYear.terms.at(-1); // latest term
    console.log("Current term:", currentTerm);

    if (!currentTerm) {
      console.log("Term not found. Returning 400...");
      return res.status(400).json({ message: "Term not found" });
    }

    console.log("Calculating current week...");
    const currentWeek = Math.ceil((new Date(date).getDate()) / 7);
    console.log("Current week:", currentWeek);

    console.log("Checking if week attendance already exists...");
    let weekAttendance = currentTerm.attendance.find(a => a.week === currentWeek);
    console.log("Week attendance found:", weekAttendance);

    if (!weekAttendance) {
      console.log("Creating new week attendance...");
      weekAttendance = { week: currentWeek, days: Array(5).fill(false) };
      currentTerm.attendance.push(weekAttendance);
      console.log("New week attendance created:", weekAttendance);
    }

    console.log("Calculating day index...");
    const dayIndex = new Date(date).getDay() - 1; // Mon = 0, Tue = 1...
    console.log("Day index:", dayIndex);

    if (dayIndex >= 0 && dayIndex <= 4) {
      console.log("Marking attendance...");
      weekAttendance.days[dayIndex] = present;
      console.log("Attendance marked:", weekAttendance.days);
    }

    console.log("Marking student document as modified...");
    student.markModified("academicRecords");

    console.log("Saving student document...");
    await student.save();
    console.log("Student document saved.");

    console.log("Returning success response...");
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Failed to mark attendance", error: err.message });
  }
};


