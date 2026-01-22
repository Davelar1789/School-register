import Attendance from "../models/Attendance.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from '../models/Class.model.js';
import Students from "../models/Student.model.js";
import Event from "../models/Event.model.js"; // ✅ Import Event model
import mongoose from "mongoose";
import { createNotification } from "../controllers/NotificationController.js";
import { sendMail } from './mailerController.js';

// Helper function to check if a date is a weekend
const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

// ✅ NEW: Helper function to check if a date is a holiday
const isHoliday = async (date, schoolId) => {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const holiday = await Event.findOne({
    school: schoolId,
    type: 'holiday',
    date: { $gte: startOfDay, $lte: endOfDay },
    isActive: true
  });

  return !!holiday;
};

// ✅ NEW: Helper function to validate attendance date
const validateAttendanceDate = async (date, term, schoolId) => {
  const attendanceDate = new Date(date);
  
  // Check if date is within term range
  if (attendanceDate < term.startDate || attendanceDate > term.endDate) {
    return { valid: false, message: "Date must be within the term period." };
  }
  
  // Check if date is a weekend
  if (isWeekend(attendanceDate)) {
    return { valid: false, message: "Attendance cannot be marked on weekends." };
  }
  
  // Check if date is a holiday
  const holiday = await isHoliday(attendanceDate, schoolId);
  if (holiday) {
    return { valid: false, message: "Attendance cannot be marked on holidays." };
  }
  
  return { valid: true };
};

// MARK ATTENDANCE (Single Student)
export const markAttendance = async (req, res) => {
  try {
    const { studentId, termId, date, present } = req.body;

    // Validate term session
    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term session not found." });

    // Get student's school
    const student = await Students.findById(studentId).select('schoolId');
    if (!student) return res.status(404).json({ message: "Student not found." });

    // ✅ Validate date (including holiday check)
    const dateValidation = await validateAttendanceDate(date, term, student.schoolId);
    if (!dateValidation.valid) {
      return res.status(400).json({ message: dateValidation.message });
    }

    // Prevent duplicate attendance records
    const existingAttendance = await Attendance.findOne({ studentId, termId, date });
    if (existingAttendance) {
      return res.status(400).json({ message: "Attendance for this student on this date is already recorded." });
    }

    // Create attendance entry
    const newAttendance = new Attendance({ studentId, termId, date, present });
    await newAttendance.save();
    res.status(201).json({ message: "Attendance recorded successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MARK ATTENDANCE BATCH
export const markAttendanceBatch = async (req, res) => {
  console.log(`Marking attendance batch for Term ID: ${req.body.termId}, Date: ${req.body.date}`);

  try {
    const { termId, date, attendanceList, classId } = req.body;

    console.log(`Fetching class details for Class ID: ${classId}...`);
    const classData = await Class.findById(classId).populate('schoolId');
    if (!classData) {
      console.log(`Error: Class not found for Class ID: ${classId}`);
      return res.status(404).json({ message: "Class not found." });
    }

    const className = classData.className;
    const schoolId = classData.schoolId || classData.school; // Handle both field names
    console.log(`Class name found: ${className}`);

    console.log(`Validating term session for Term ID: ${termId}...`);
    const term = await TermSession.findById(termId);
    if (!term) {
      console.log(`Error: Term session not found for Term ID: ${termId}`);
      return res.status(404).json({ message: "Term session not found." });
    }

    // ✅ Validate date (including holiday check)
    const dateValidation = await validateAttendanceDate(date, term, schoolId);
    if (!dateValidation.valid) {
      console.log(`Error: ${dateValidation.message}`);
      return res.status(400).json({ message: dateValidation.message });
    }

    console.log(`Checking for existing attendance records for Class: ${className}, Date: ${date}...`);
    const existingRecords = await Attendance.find({ termId, classId, date });
    if (existingRecords.length > 0) {
      console.log(`Error: Attendance already recorded for Class: ${className} on Date: ${date}`);
      return res.status(400).json({ message: "Attendance for this class on this date is already recorded." });
    }

    console.log('Formatting batch attendance entries...');
    const attendanceEntries = attendanceList.map(({ studentId, present }) => ({
      studentId,
      termId,
      classId,
      date,
      present,
    }));

    console.log('Inserting attendance records...');
    await Attendance.insertMany(attendanceEntries);

    console.log(`Attendance recorded successfully for all students in Class: ${className}`);

    return res.status(201).json({
      message: `Attendance recorded successfully for class "${className}".`,
      className,
      date,
    });

  } catch (error) {
    console.error("❌ Error marking attendance batch:", error);
    res.status(500).json({ error: error.message });
  }
};

// FETCH ATTENDANCE
export const fetchAttendance = async (req, res) => {
  try {
    const { termId, studentId, classId, date } = req.query;

    let query = {};
    if (termId) query.termId = termId;
    if (studentId) query.studentId = studentId;

    if (classId) {
      const students = await Students.find({ classes: classId }).select("_id");

      if (!students.length) {
        console.warn("No students found for class:", classId);
      }

      query.studentId = { $in: students.map((s) => s._id) };
    }

    if (date) {
      const formattedDate = new Date(date);

      if (isNaN(formattedDate.getTime())) {
        console.error("Invalid date format:", date);
        return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD." });
      }

      query.date = formattedDate;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: "studentId",
        model: "students",
        select: "name idno"
      })
      .populate("termId", "termName");

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// UPDATE ATTENDANCE
export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { present } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return res.status(404).json({ message: "Attendance record not found." });

    attendance.present = present;
    await attendance.save();
    res.status(200).json({ message: "Attendance updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH STUDENT ATTENDANCE
export const fetchStudentAttendance = async (req, res) => {
  try {
    const { termId, classId, viewBy = "term" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(termId)) {
      return res.status(400).json({ message: "Invalid term ID format." });
    }

    const term = await TermSession.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term session not found." });
    }

    const today = new Date();
    let startDate = new Date(term.startDate);
    let endDate = new Date(today);

    const validViews = ["today", "week", "month", "term"];
    if (!validViews.includes(viewBy)) {
      return res.status(400).json({ message: "Invalid viewBy option." });
    }

    switch (viewBy) {
      case "today":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;

      case "week": {
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(today);
        startDate.setDate(today.getDate() + mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 4);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "term":
      default:
        break;
    }

    // ✅ Helper: Count valid school days (Mon-Fri, excluding holidays)
    const getSchoolDays = async (start, end, schoolId) => {
      let count = 0;
      let current = new Date(start);
      while (current <= end) {
        const isWeekendDay = current.getDay() === 0 || current.getDay() === 6;
        const isHolidayDay = await isHoliday(current, schoolId);
        
        if (!isWeekendDay && !isHolidayDay) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    let students;
    let schoolId;

    if (classId === "all") {
      students = await Students.find({}).select("_id name idno feedingFee schoolId");
      schoolId = students.length > 0 ? students[0].schoolId : null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid class ID format." });
      }

      students = await Students.find({ classes: classId }).select("_id name idno feedingFee schoolId");
      schoolId = students.length > 0 ? students[0].schoolId : null;
    }

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this class." });
    }

    const totalSchoolDays = await getSchoolDays(startDate, endDate, schoolId);

    const studentAttendance = await Promise.all(
      students.map(async (student) => {
        const attendanceCount = await Attendance.countDocuments({
          studentId: student._id,
          termId,
          present: true,
          date: { $gte: startDate, $lte: endDate },
        });

        return {
          _id: student._id,
          name: student.name,
          idno: student.idno,
          feedingFee: student.feedingFee,
          totalPresentDays: attendanceCount,
          totalSchoolDays,
        };
      })
    );

    res.status(200).json(studentAttendance);
  } catch (error) {
    console.error("Error fetching student attendance:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// FETCH TOTAL FEES BY SCHOOL VIEW
export const fetchTotalFeesBySchoolView = async (req, res) => {
  try {
    const { termId, viewBy = "term" } = req.query;
    const { schoolId } = req.params;

    console.log("Incoming request to fetchTotalFeesBySchoolView");
    console.log("Query params =>", { termId, schoolId, viewBy });

    if (!mongoose.Types.ObjectId.isValid(termId)) {
      console.warn("Invalid term ID format:", termId);
      return res.status(400).json({ message: "Invalid term ID format." });
    }

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      console.warn("Invalid school ID format:", schoolId);
      return res.status(400).json({ message: "Invalid school ID format." });
    }

    const term = await TermSession.findById(termId);
    if (!term) {
      console.warn("Term not found for ID:", termId);
      return res.status(404).json({ message: "Term session not found." });
    }

    const today = new Date();
    let startDate = new Date(term.startDate);
    let endDate = new Date(today);

    const validViews = ["today", "week", "month", "term"];
    if (!validViews.includes(viewBy)) {
      console.warn("Invalid viewBy option received:", viewBy);
      return res.status(400).json({ message: "Invalid viewBy option." });
    }

    switch (viewBy) {
      case "today":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;

      case "week": {
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(today);
        startDate.setDate(today.getDate() + mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 4);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "term":
      default:
        endDate = new Date(term.endDate);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    console.log("Calculated date range =>", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const students = await Students.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
    }).select("_id name feedingFee");

    if (!students.length) {
      console.warn("No students found for school:", schoolId);
      return res.status(404).json({ message: "No students found in this school." });
    }

    let totalFee = 0;
    const detailedStudents = [];

    for (const student of students) {
      const attendanceCount = await Attendance.countDocuments({
        studentId: student._id,
        termId,
        present: true,
        date: { $gte: startDate, $lte: endDate },
      });

      const studentFee = (student.feedingFee || 0) * attendanceCount;
      totalFee += studentFee;

      detailedStudents.push({
        _id: student._id,
        name: student.name,
        feedingFee: student.feedingFee || 0,
        totalPresentDays: attendanceCount,
        totalAmountPaid: studentFee,
      });
    }

    console.log("Total school feeding fee calculated:", totalFee);

    res.status(200).json({
      viewBy,
      startDate,
      endDate,
      totalFee,
      totalSchoolPaid: totalFee,
      students: detailedStudents,
      currency: "GHS",
    });
  } catch (error) {
    console.error("❌ Error fetching total school fees:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// GET FEEDING DAILY
export const getFeedingDaily = async (req, res) => {
  try {
    const { termId, classId, date } = req.query;
    if (!termId || !classId || !date) {
      return res.status(400).json({ message: "Missing termId, classId, or date" });
    }

    const targetDate = new Date(date);
    const students = await Students.find({ classId }).select("name idno");

    const attendanceRecords = await Attendance.find({
      termId,
      classId,
      date: targetDate
    }).lean();

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.present;
    });

    const result = students.map(student => ({
      _id: student._id,
      name: student.name,
      idno: student.idno,
      present: attendanceMap[student._id.toString()] ?? false
    }));

    res.status(200).json({
      date: targetDate,
      totalPresent: result.filter(s => s.present).length,
      students: result
    });
  } catch (error) {
    console.error("Error fetching daily feeding attendance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET FEEDING WEEKLY
export const getFeedingWeekly = async (req, res) => {
  try {
    const { termId, classId, from, to } = req.query;
    if (!termId || !classId || !from || !to) {
      return res.status(400).json({ message: "Missing termId, classId, from or to" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const students = await Students.find({ classId }).select("name idno");

    const attendanceRecords = await Attendance.find({
      termId,
      classId,
      date: { $gte: fromDate, $lte: toDate }
    }).lean();

    const grouped = {};

    attendanceRecords.forEach(({ studentId, date, present }) => {
      if (isWeekend(date)) return;
      const id = studentId.toString();
      if (!grouped[id]) grouped[id] = 0;
      if (present) grouped[id]++;
    });

    const result = students.map(student => ({
      _id: student._id,
      name: student.name,
      idno: student.idno,
      presentDays: grouped[student._id.toString()] ?? 0
    }));

    res.status(200).json({
      weekStart: fromDate,
      weekEnd: toDate,
      students: result
    });
  } catch (error) {
    console.error("Error fetching weekly feeding attendance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET FEEDING MONTHLY
export const getFeedingMonthly = async (req, res) => {
  try {
    const { termId, classId, month } = req.query;
    if (!termId || !classId || !month) {
      return res.status(400).json({ message: "Missing termId, classId, or month" });
    }

    const [year, monthNumber] = month.split("-").map(Number);
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0);

    const students = await Students.find({ classId }).select("name idno");

    const attendanceRecords = await Attendance.find({
      termId,
      classId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const grouped = {};

    attendanceRecords.forEach(({ studentId, date, present }) => {
      if (isWeekend(date)) return;
      const id = studentId.toString();
      if (!grouped[id]) grouped[id] = 0;
      if (present) grouped[id]++;
    });

    const result = students.map(student => ({
      _id: student._id,
      name: student.name,
      idno: student.idno,
      presentDays: grouped[student._id.toString()] ?? 0
    }));

    res.status(200).json({
      month,
      students: result
    });
  } catch (error) {
    console.error("Error fetching monthly feeding attendance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// UPDATE ATTENDANCE 2
export const updateAttendance2 = async (req, res) => {
  const { termId, classId, date, attendanceList } = req.body;

  if (!termId || !classId || !date || !attendanceList) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const attendanceDate = new Date(date);
    
    // ✅ Get school ID from class
    const classData = await Class.findById(classId).select('schoolId school');
    if (!classData) {
      return res.status(404).json({ error: "Class not found." });
    }
    
    const schoolId = classData.schoolId || classData.school;
    
    // ✅ Check for weekend
    if ([0, 6].includes(attendanceDate.getDay())) {
      return res.status(400).json({ error: "Cannot mark attendance on weekends." });
    }
    
    // ✅ Check for holiday
    const holiday = await isHoliday(attendanceDate, schoolId);
    if (holiday) {
      return res.status(400).json({ error: "Cannot mark attendance on holidays." });
    }

    const bulkOperations = attendanceList.map(({ studentId, present }) => ({
      updateOne: {
        filter: { studentId, termId, date: attendanceDate },
        update: { present },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOperations);

    res.status(200).json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ error: "Server error updating attendance." });
  }
};

// FETCH UNMARKED DATES
export const fetchUnmarkedDates = async (req, res) => {
  try {
    const { classId, termId } = req.query;

    console.log("📥 Incoming:", req.query);

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId are required." });
    }

    const classDoc = await Class.findById(classId).select("students schoolId school");

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }

    if (!classDoc.students || classDoc.students.length === 0) {
      return res.status(404).json({ message: "No students in this class." });
    }

    console.log("👨‍👩‍👦 Total students found:", classDoc.students.length);

    const schoolId = classDoc.schoolId || classDoc.school;
    
    const term = await TermSession.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term not found." });
    }

    const start = new Date(term.startDate);
    const end = new Date(term.endDate);
    const today = new Date();
    
    // Only check dates up to today (no point checking future dates)
    const endDate = end < today ? end : today;

    console.log("📅 Term Range:", start.toISOString(), "→", endDate.toISOString());

    // ✅ OPTIMIZATION 1: Fetch ALL holidays for the term in ONE query
    const holidays = await Event.find({
      school: schoolId,
      type: 'holiday',
      isActive: true,
      date: { $gte: start, $lte: endDate }
    }).select('date').lean();

    // Create a Set of holiday date strings for O(1) lookup
    const holidaySet = new Set(
      holidays.map(h => new Date(h.date).toISOString().slice(0, 10))
    );

    console.log("🏖️ Total holidays found:", holidaySet.size);

    // ✅ OPTIMIZATION 2: Generate all valid school days (Mon-Fri, excluding holidays) in memory
    const normalize = (d) => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const allValidSchoolDays = new Set();
    const temp = new Date(start);

    while (temp <= endDate) {
      const dayOfWeek = temp.getUTCDay();
      const dateStr = normalize(temp);
      
      // Include only weekdays that are not holidays
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
        allValidSchoolDays.add(dateStr);
      }
      
      temp.setUTCDate(temp.getUTCDate() + 1);
    }

    console.log("📘 Total valid school days:", allValidSchoolDays.size);

    // ✅ OPTIMIZATION 3: Fetch ALL marked attendance dates for this class/term in ONE query
    const markedAttendance = await Attendance.find({
      termId,
      classId,
      date: { $gte: start, $lte: endDate }
    })
    .select('date')
    .distinct('date')
    .lean();

    // Create a Set of marked date strings for O(1) lookup
    const markedDatesSet = new Set(
      markedAttendance.map(date => normalize(new Date(date)))
    );

    console.log("✅ Total marked dates:", markedDatesSet.size);

    // ✅ OPTIMIZATION 4: Use Set difference to find unmarked dates in O(n)
    const unmarkedDates = [];
    
    for (const schoolDay of allValidSchoolDays) {
      if (!markedDatesSet.has(schoolDay)) {
        // Convert back to ISO string for response
        unmarkedDates.push(new Date(schoolDay + 'T00:00:00.000Z').toISOString());
      }
    }

    // Sort unmarked dates chronologically
    unmarkedDates.sort();

    console.log("🚨 Unmarked count:", unmarkedDates.length);

    return res.status(200).json({
      totalSchoolDays: allValidSchoolDays.size,
      markedDays: markedDatesSet.size,
      unmarkedCount: unmarkedDates.length,
      unmarkedDates: unmarkedDates
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// export const markAttendanceBatch = async (req, res) => {
//     console.log(`Marking attendance batch for Term ID: ${req.body.termId}, Date: ${req.body.date}`);

//     try {
//         const { termId, date, attendanceList, classId, teacherEmail, teacherId } = req.body; // ✅ Now receiving teacherId from frontend

       
//         console.log(`Fetching class details for Class ID: ${classId}...`);
//         const classData = await Class.findById(classId);
//         if (!classData) {
//             console.log(`Error: Class not found for Class ID: ${classId}`);
//             return res.status(404).json({ message: "Class not found." });
//         }

//         const className = classData.className; // ✅ Extract class name
//         console.log(`Class name found: ${className}`);

//         console.log(`Validating term session for Term ID: ${termId}...`);
//         const term = await TermSession.findById(termId);
//         if (!term) {
//             console.log(`Error: Term session not found for Term ID: ${termId}`);
//             return res.status(404).json({ message: "Term session not found." });
//         }

//         const attendanceDate = new Date(date);
//         console.log(`Attendance date parsed: ${attendanceDate}`);

//         if (attendanceDate < term.startDate || attendanceDate > term.endDate || isWeekend(attendanceDate)) {
//             console.log(`Error: Invalid attendance date (${attendanceDate}) - Out of term range or weekend.`);
//             return res.status(400).json({ message: "Invalid attendance date (must be within term and not on weekends)." });
//         }

//         console.log(`Checking for existing attendance records for Class: ${className}, Date: ${date}...`);
//         const existingRecords = await Attendance.find({ termId, classId, date });
//         if (existingRecords.length > 0) {
//             console.log(`Error: Attendance already recorded for Class: ${className} on Date: ${date}`);
//             return res.status(400).json({ message: "Attendance for this class on this date is already recorded." });
//         }

//         console.log('Formatting batch attendance entries...');
//         const attendanceEntries = attendanceList.map(({ studentId, present }) => ({
//             studentId,
//             termId,
//             classId,
//             date,
//             present,
//         }));

//         console.log('Inserting attendance records...');
//         await Attendance.insertMany(attendanceEntries);

//         console.log(`Attendance recorded successfully for all students in Class: ${className}`);
        
//         //  if (!teacherEmail || !teacherId) { // ✅ Validate both teacherEmail & teacherId
//         //     console.log('Error: Teacher email or ID not provided.');
//         //     return res.status(400).json({ message: "Teacher email and ID are required." });
//         // }

//         // // **Send confirmation email to the teacher**
//         // console.log(`📧 Preparing to send email to: ${teacherEmail}...`);

//         // try {
//         //     const emailMessage = `
//         //         Dear Teacher,  
                
//         //         You have successfully submitted attendance for your class on **${date}**.  
                
//         //         Thank you for your time and dedication.  
                
//         //         Best regards,  
//         //         Joyful Brains Academy
//         //     `;

//         //     const emailResponse = await sendMail(
//         //         teacherEmail,
//         //         "Attendance Submission Confirmation",
//         //         emailMessage // ✅ Use formatted message
//         //     );

//         //     console.log(`✅ Email sent successfully! Response: ${JSON.stringify(emailResponse, null, 2)}`);
//         //     res.status(201).json({ message: `Attendance recorded successfully for class "${className}", and email sent to the teacher.` });

//             // // ✅ Trigger notification for the teacher using received `teacherId`
//             // await createNotification(
//             //     [], // No users (admins) in this case
//             //     [teacherId], // ✅ Use received teacherId from frontend
//             //     "Attendance Successfully Recorded",
//             //     `Attendance for ${className} on ${date} has been successfully recorded.`,
//             //     "attendance"
//             // );

//         // } catch (emailError) {
//         //     console.error("❌ Error sending notification:", emailError);
//         //     res.status(500).json({ message: `Attendance recorded for class "${className}", but notification sending failed.` });
//         // }

//     } catch (error) {
//         console.error("❌ Error marking attendance batch:", error);
//         res.status(500).json({ error: error.message });
//     }
// };