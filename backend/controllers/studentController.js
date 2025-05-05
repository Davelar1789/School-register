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
  console.log("📌 Marking attendance...");
  console.log("📝 Request body:", req.body);

  const { classId, attendance } = req.body;
  const date = new Date(); // Use server time for marking

  try {
    for (const record of attendance) {
      const { studentId, present } = record;

      console.log("\n🎯 Processing student:", studentId);
      console.log("📅 Date:", date.toISOString());
      console.log("✅ Present:", present);

      const student = await Students.findById(studentId);
      if (!student) {
        console.log("❌ Student not found:", studentId);
        return res.status(404).json({ message: `Student not found: ${studentId}` });
      }

      console.log("👤 Student found:", {
        id: student._id,
        name: student.name,
      });

      // Step 1: Locate academic year
      const year = date.getFullYear();
      const academicYearIndex = student.academicRecords.findIndex((rec) =>
        rec.yearLabel.includes(year.toString())
      );

      if (academicYearIndex === -1) {
        console.log("❌ Academic year not found for:", year);
        return res.status(400).json({ message: "Academic year not found" });
      }

      const academicYear = student.academicRecords[academicYearIndex];
      console.log("📘 Academic year found:", academicYear.yearLabel);

      // Step 2: Get latest term
      const currentTermIndex = academicYear.terms.length - 1;
      const currentTerm = academicYear.terms[currentTermIndex];

      if (!currentTerm) {
        console.log("❌ No terms found in academic year.");
        return res.status(400).json({ message: "Term not found" });
      }

      console.log("🗓️ Current term:", currentTerm.termName);

      // Step 3: Calculate current week of the month
      const currentDay = date.getDate();
      const currentWeek = Math.ceil(currentDay / 7);
      console.log("📆 Current week of term:", currentWeek);

      // Step 4: Check or create week attendance
      let weekAttendance = currentTerm.attendance.find((a) => a.week === currentWeek);
      if (!weekAttendance) {
        console.log("🆕 Creating new week attendance...");
        weekAttendance = { week: currentWeek, days: Array(5).fill(false) };
        currentTerm.attendance.push(weekAttendance);
        console.log("✅ Week attendance created:", weekAttendance);
      } else {
        console.log("🔁 Found existing week attendance:", weekAttendance);
      }

      // Step 5: Determine the index of the day (Mon=0 ... Fri=4)
      const jsDay = date.getDay(); // Sunday = 0, Monday = 1
      const dayIndex = jsDay - 1;

      if (dayIndex >= 0 && dayIndex <= 4) {
        console.log(`🕐 Marking attendance for weekday index: ${dayIndex}`);
        weekAttendance.days[dayIndex] = present;
        console.log("📝 Updated attendance days:", weekAttendance.days);
      } else {
        console.log("⛔ Skipping attendance — weekend or invalid day:", jsDay);
      }

      // Step 6: Mark modified path correctly
      const modifiedPath = `academicRecords.${academicYearIndex}.terms.${currentTermIndex}.attendance`;
      console.log("🛠️ Marking path as modified:", modifiedPath);
      student.markModified(modifiedPath);

      // Step 7: Save updated student
      console.log("💾 Saving updated student document...");
      await student.save();
      console.log("Student attendance saved successfully.");
    }

    console.log("🎉 Attendance marking complete.");
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("🔥 Error while marking attendance:", err);
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

export const getAttendanceForClassOnDate = async (req, res) => {
  try {
    const { classId, date } = req.body;
    if (!classId || !date) {
      return res.status(400).json({ message: "Class ID and date are required." });
    }

    const targetDate = new Date(date);
    const currentDay = targetDate.getDay(); // 0 (Sun) to 6 (Sat)

    // Disallow weekends
    if (currentDay === 0 || currentDay === 6) {
      return res.status(200).json({
        isSchoolDay: false,
        message: "Selected date is a weekend.",
        date: targetDate,
        attendance: [],
        termStartDate: null,
        termEndDate: null,
      });
    }

    targetDate.setHours(0, 0, 0, 0); // Normalize

    const students = await Students.find({ classes: classId });

    if (!students.length) {
      return res.status(404).json({ message: "No students found in this class." });
    }

    const results = [];
    let termStartDate = null;
    let termEndDate = null;
    let foundTerm = false;

    for (const student of students) {
      const currentTerm = await TermSession.findOne({
        schoolId: student.schoolId,
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate },
        isActive: true,
      });

      if (!currentTerm) continue; // Skip students with no active term

      if (!foundTerm) {
        // Set term range once from first student with active term
        termStartDate = currentTerm.startDate;
        termEndDate = currentTerm.endDate;
        foundTerm = true;
      }

      const academicYear = student.academicRecords.find(
        (rec) => rec.yearLabel === currentTerm.yearLabel
      );
      if (!academicYear) continue;

      const studentTerm = academicYear.terms.find(
        (term) => term.termName === currentTerm.termName
      );
      if (!studentTerm) continue;

      const currentWeek = Math.ceil(targetDate.getDate() / 7);
      const dayIndex = currentDay - 1;

      const attendanceRecord = studentTerm.attendance.find(a => a.week === currentWeek);
      const isPresent = attendanceRecord?.days?.[dayIndex] || false;

      results.push({
        studentId: student._id,
        name: student.name,
        present: isPresent,
      });
    }

    // If no student had a valid term, return isSchoolDay: false
    const isSchoolDay = foundTerm;

    return res.status(200).json({
      date: targetDate,
      attendance: results,
      isSchoolDay,
      termStartDate,
      termEndDate,
    });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return res.status(500).json({ message: "Error fetching attendance", error: err.message });
  }
};
