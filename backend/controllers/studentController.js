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
  const { classId, attendance, date } = req.body;

  console.log("📥 Received attendance marking request");
  console.log("➡️ Class ID:", classId);
  console.log("➡️ Date:", date);
  console.log("➡️ Attendance Records Count:", attendance?.length);

  if (!classId || !attendance || !date) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ message: "Class ID, attendance, and date are required." });
  }

  const targetDate = new Date(new Date(date).toISOString().split("T")[0]);
  const jsDay = targetDate.getUTCDay(); // Sunday = 0
  const dayIndex = jsDay - 1; // Monday = 0

  console.log("📅 Normalized Target Date:", targetDate.toISOString());
  console.log("📆 Day of Week (0=Sun...6=Sat):", jsDay);
  console.log("📌 Day Index for Attendance Array (0=Mon):", dayIndex);

  if (dayIndex < 0 || dayIndex > 4) {
    console.warn("❌ Invalid school day. Not Monday to Friday.");
    return res.status(400).json({ message: "Selected date is not a school day (Mon-Fri)." });
  }

  const weekOfMonth = Math.ceil(targetDate.getUTCDate() / 7);
  console.log("📊 Calculated Week of Month:", weekOfMonth);

  let marked = 0;
  let alreadyMarked = 0;

  try {
    for (const [i, record] of attendance.entries()) {
      const { studentId, present } = record;
      console.log(`\n🔍 [${i + 1}] Processing studentId: ${studentId} | Present: ${present}`);

      const student = await Students.findById(studentId);
      if (!student) {
        console.warn(`🚫 Student not found with ID: ${studentId}`);
        continue;
      }

      const year = targetDate.getUTCFullYear();
      const academicYearIndex = student.academicRecords.findIndex((rec) =>
        rec.yearLabel.includes(year.toString())
      );

      if (academicYearIndex === -1) {
        console.warn(`⚠️ No academic year found for ${year} in student ${student.name}`);
        continue;
      }

      const academicYear = student.academicRecords[academicYearIndex];
      const currentTermIndex = academicYear.terms.length - 1;
      const currentTerm = academicYear.terms[currentTermIndex];

      if (!currentTerm) {
        console.warn(`❌ No current term found for student ${student.name}`);
        continue;
      }

      console.log(`📚 Found term "${currentTerm.termName}" for ${student.name}`);

      let weekAttendance = currentTerm.attendance.find((a) => a.week === weekOfMonth);
      if (!weekAttendance) {
        weekAttendance = { week: weekOfMonth, days: Array(5).fill("not_marked") };
        currentTerm.attendance.push(weekAttendance);
        console.log(`➕ Created new attendance entry for week ${weekOfMonth}`);
      }

      const currentStatus = weekAttendance.days[dayIndex];
      if (currentStatus !== "not_marked") {
        console.log(`⏭️ Already marked as ${currentStatus} for dayIndex ${dayIndex}`);
        alreadyMarked++;
        continue;
      }

      weekAttendance.days[dayIndex] = present ? "present" : "absent";
      console.log(`✅ Marked student ${student.name} as "${weekAttendance.days[dayIndex]}"`);

      const allAttendance = currentTerm.attendance.flatMap((w) => w.days);
      currentTerm.totalAttendance = allAttendance.filter((val) => val === "present").length;
      console.log(`📈 Total 'present' days after update: ${currentTerm.totalAttendance}`);

      const modPath = `academicRecords.${academicYearIndex}.terms.${currentTermIndex}`;
      student.markModified(modPath);

      await student.save();
      console.log(`💾 Saved attendance for student ${student.name}`);
      marked++;
    }

    console.log("\n📋 Attendance marking summary:");
    console.log("➡️ Successfully Marked:", marked);
    console.log("➡️ Skipped (Already Marked):", alreadyMarked);

    return res.json({
      message: `Attendance marking completed for ${targetDate.toISOString().split("T")[0]}.`,
      updated: marked,
      skipped: alreadyMarked,
    });
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
    console.log("📥 Incoming Request - Get Attendance For Class On Date");
    console.log("📌 Class ID:", classId);
    console.log("📅 Date:", date);

    if (!classId || !date) {
      console.warn("⚠️ Missing classId or date in request body");
      return res.status(400).json({ message: "Class ID and date are required." });
    }

    const targetDate = new Date(new Date(date).toISOString().split("T")[0]);
    const dayOfWeek = targetDate.getUTCDay(); // 0 (Sun) - 6 (Sat)
    console.log("📆 Target Date (normalized):", targetDate.toISOString());
    console.log("🗓️ Day of Week:", dayOfWeek, "(0 = Sun, 6 = Sat)");

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log("🚫 Selected date is a weekend. No attendance expected.");
      return res.status(200).json({
        isSchoolDay: false,
        message: "Selected date is a weekend.",
        date: targetDate,
        attendance: [],
        termStartDate: null,
        termEndDate: null,
        attendanceSubmitted: false,
      });
    }

    const students = await Students.find({ classes: classId });
    console.log(`👥 Found ${students.length} student(s) in class ${classId}`);

    if (!students.length) {
      console.warn("❌ No students found in the class.");
      return res.status(404).json({ message: "No students found in this class." });
    }

    const results = [];
    let termStartDate = null;
    let termEndDate = null;
    let foundTerm = false;
    let allMarked = true;

    const currentWeek = Math.ceil(targetDate.getUTCDate() / 7);
    const dayIndex = dayOfWeek - 1; // Mon = 0
    console.log("🧮 Calculated Week of Month:", currentWeek);
    console.log("📍 Day Index (Mon=0):", dayIndex);

    for (const student of students) {
      console.log(`🔎 Checking student: ${student.name} (${student._id})`);

      const currentTerm = await TermSession.findOne({
        schoolId: student.schoolId,
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate },
        isActive: true,
      });

      if (!currentTerm) {
        console.warn(`⚠️ No active term found for student ${student.name}`);
        continue;
      }

      if (!foundTerm) {
        termStartDate = currentTerm.startDate;
        termEndDate = currentTerm.endDate;
        foundTerm = true;
        console.log("✅ Term Found:");
        console.log("   📅 Term Start:", termStartDate);
        console.log("   📅 Term End:", termEndDate);
      }

      const academicYear = student.academicRecords.find(
        (rec) => rec.yearLabel === currentTerm.yearLabel
      );
      if (!academicYear) {
        console.warn(`⚠️ Academic year mismatch for student ${student.name}`);
        continue;
      }

      const studentTerm = academicYear.terms.find(
        (term) => term.termName === currentTerm.termName
      );
      if (!studentTerm) {
        console.warn(`⚠️ Term data not found for ${student.name} in ${currentTerm.termName}`);
        continue;
      }

      const attendanceRecord = studentTerm.attendance.find(a => a.week === currentWeek);
      const status = attendanceRecord?.days?.[dayIndex] || "not_marked";

      if (status === "not_marked") {
        allMarked = false;
      }

      console.log(`   ➡️ Status for ${student.name}:`, status);

      results.push({
        studentId: student._id,
        name: student.name,
        status,
      });
    }

    const attendanceForDay = {};
    results.forEach((r) => {
      attendanceForDay[r.studentId] = r.status;
    });

    console.log("📊 Attendance Summary:", attendanceForDay);
    console.log("✅ All attendance marked?", allMarked);

    return res.status(200).json({
      isSchoolDay: foundTerm,
      termStartDate,
      termEndDate,
      attendanceForDay,
      attendanceSubmitted: allMarked && results.length > 0,
    });

  } catch (err) {
    console.error("🔥 Error fetching attendance:", err);
    return res.status(500).json({ message: "Error fetching attendance", error: err.message });
  }
};



// export const deleteAllStudents = async (req, res) => {
//   try {
//     const result = await Students.deleteMany({});
//     console.log(`🧹 Deleted ${result.deletedCount} student(s) from the database.`);
//     res.status(200).json({ message: "All students deleted successfully", deletedCount: result.deletedCount });
//   } catch (error) {
//     console.error("❌ Error deleting students:", error.message);
//     res.status(500).json({ message: "Failed to delete students", error: error.message });
//   }
// };

// export const migrateAttendanceBooleans = async (req, res) => {
//   try {
//     const students = await Students.find({});
//     let updatedCount = 0;

//     for (const student of students) {
//       let modified = false;

//       for (const year of student.academicRecords || []) {
//         for (const term of year.terms || []) {
//           for (const record of term.attendance || []) {
//             const original = [...record.days];

//             // Convert each boolean to its new string value
//             record.days = record.days.map((day) =>
//               day === true ? "present" : "not_marked"
//             );

//             // Only mark as modified if anything changed
//             if (JSON.stringify(original) !== JSON.stringify(record.days)) {
//               modified = true;
//             }
//           }
//         }
//       }

//       if (modified) {
//         student.markModified("academicRecords");
//         await student.save();
//         updatedCount++;
//         console.log(`✅ Migrated attendance for: ${student.name}`);
//       }
//     }

//     console.log(`🎉 Migration complete. Updated ${updatedCount} student(s).`);
//     res.status(200).json({
//       message: "Migration complete",
//       updatedStudents: updatedCount,
//     });
//   } catch (error) {
//     console.error("🔥 Migration failed:", error);
//     res.status(500).json({
//       message: "Migration failed",
//       error: error.message,
//     });
//   }
// };

export const fetchWeeklyAttendance = async (req, res) => {
  try {
    const { classId, weekStartDate } = req.body;
    const startDate = new Date(weekStartDate);

    const term = await TermSession.findOne({
      termStartDate: { $lte: startDate },
      termEndDate: { $gte: startDate },
    });

    if (!term) {
      return res.status(400).json({ message: "Week is not in an active term" });
    }

    const students = await Students.find({ classId });

    const attendanceForWeek = {};

    students.forEach((student) => {
      const record = student.academicRecords.find(
        (r) => r.termId.toString() === term._id.toString()
      );
      if (!record) return;

      const weekRecord = record.terms[0].attendance.find(
        (week) => new Date(week.weekStartDate).toDateString() === startDate.toDateString()
      );

      const daysMap = {};
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day, i) => {
        daysMap[day] = weekRecord?.days?.[i] || "not_marked";
      });

      attendanceForWeek[student._id] = daysMap;
    });

    res.json({
      termStartDate: term.startDate,
      termEndDate: term.endDate,
      students,
      attendanceForWeek,
    });
  } catch (err) {
    console.error("Error fetching weekly attendance:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markWeeklyAttendance = async (req, res) => {
  try {
    const { classId, weekStartDate, attendance } = req.body;
    const startDate = new Date(weekStartDate);

    const term = await TermSession.findOne({
      termStartDate: { $lte: startDate },
      termEndDate: { $gte: startDate },
    });

    if (!term) {
      return res.status(400).json({ message: "Week is not in an active term" });
    }

    for (const { studentId, days } of attendance) {
      const student = await Students.findById(studentId);
      if (!student) continue;

      let record = student.academicRecords.find(
        (r) => r.termId.toString() === term._id.toString()
      );

      if (!record) {
        record = {
          termId: term._id,
          terms: [{ attendance: [] }],
        };
        student.academicRecords.push(record);
      }

      let weekRecord = record.terms[0].attendance.find(
        (week) => new Date(week.weekStartDate).toDateString() === startDate.toDateString()
      );

      if (!weekRecord) {
        weekRecord = { weekStartDate: startDate, days: ["not_marked", "not_marked", "not_marked", "not_marked", "not_marked"] };
        record.terms[0].attendance.push(weekRecord);
      }

      // Update each day's attendance
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day, i) => {
        if (days[day]) {
          weekRecord.days[i] = days[day];
        }
      });

      await student.save();
    }

    res.json({ message: "Weekly attendance submitted successfully" });
  } catch (err) {
    console.error("Error marking weekly attendance:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};