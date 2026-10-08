import Attendance from "../models/Attendance.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from '../models/Class.model.js';
import Students from "../models/Student.model.js";
import Event from "../models/Event.model.js";
import mongoose from "mongoose";
import { createNotification } from "../controllers/NotificationController.js";
import { sendMail } from './mailerController.js';

// ============================
// HELPER FUNCTIONS
// ============================

// Helper function to check if a date is a weekend
const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

// Helper function to normalize date to YYYY-MM-DD format
const normalizeDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper function to check if a date is a holiday
const isHoliday = async (date, schoolId) => {
  try {
    const normalizedDate = normalizeDate(date);
    const startOfDay = new Date(normalizedDate + 'T00:00:00.000Z');
    const endOfDay = new Date(normalizedDate + 'T23:59:59.999Z');

    const holiday = await Event.findOne({
      school: schoolId,
      type: 'holiday',
      isActive: true,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return !!holiday;
  } catch (error) {
    console.error('Error checking holiday:', error);
    return false;
  }
};

// Helper function to get all holidays for a date range
const getHolidaysInRange = async (startDate, endDate, schoolId) => {
  try {
    const holidays = await Event.find({
      school: schoolId,
      type: 'holiday',
      isActive: true,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).select('date').lean();

    return new Set(holidays.map(h => normalizeDate(h.date)));
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return new Set();
  }
};

// Helper: Count valid school days (Mon-Fri, excluding holidays)
const getSchoolDays = async (start, end, schoolId) => {
  const holidays = await getHolidaysInRange(start, end, schoolId);
  let count = 0;
  let current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = normalizeDate(current);
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// ============================
// MARK ATTENDANCE
// ============================

export const markAttendance = async (req, res) => {
  try {
    const { studentId, termId, date, present } = req.body;

    // Validate date against term session
    const term = await TermSession.findById(termId).populate('school');
    if (!term) return res.status(404).json({ message: "Term session not found." });

    const attendanceDate = new Date(date);
    
    // Check if date is within term range
    if (attendanceDate < term.startDate || attendanceDate > term.endDate) {
      return res.status(400).json({ message: "Date must be within term period." });
    }

    // Check if weekend
    if (isWeekend(attendanceDate)) {
      return res.status(400).json({ message: "Cannot mark attendance on weekends." });
    }

    // Check if holiday
    const schoolId = term.school?._id || term.school;
    const isHolidayDate = await isHoliday(attendanceDate, schoolId);
    if (isHolidayDate) {
      return res.status(400).json({ 
        message: "Cannot mark attendance on holidays.",
        type: "holiday"
      });
    }

    // Prevent duplicate attendance records
    const existingAttendance = await Attendance.findOne({ 
      studentId, 
      termId, 
      date: {
        $gte: new Date(normalizeDate(attendanceDate) + 'T00:00:00.000Z'),
        $lte: new Date(normalizeDate(attendanceDate) + 'T23:59:59.999Z')
      }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        message: "Attendance for this student on this date is already recorded." 
      });
    }

    // Create attendance entry
    const newAttendance = new Attendance({ studentId, termId, date: attendanceDate, present });
    await newAttendance.save();
    
    res.status(201).json({ message: "Attendance recorded successfully." });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// MARK ATTENDANCE BATCH
// ============================

export const markAttendanceBatch = async (req, res) => {
  console.log(`Marking attendance batch for Term ID: ${req.body.termId}, Date: ${req.body.date}`);

  try {
    const { termId, date, attendanceList, classId } = req.body;

    console.log(`Fetching class details for Class ID: ${classId}...`);
    const classData = await Class.findById(classId).populate('school');
    if (!classData) {
      console.log(`Error: Class not found for Class ID: ${classId}`);
      return res.status(404).json({ message: "Class not found." });
    }

    const className = classData.className;
    const schoolId = classData.school?._id || classData.school;
    console.log(`Class name found: ${className}`);

    console.log(`Validating term session for Term ID: ${termId}...`);
    const term = await TermSession.findById(termId);
    if (!term) {
      console.log(`Error: Term session not found for Term ID: ${termId}`);
      return res.status(404).json({ message: "Term session not found." });
    }

    const attendanceDate = new Date(date);
    console.log(`Attendance date parsed: ${attendanceDate}`);

    // Validate date range
    if (attendanceDate < term.startDate || attendanceDate > term.endDate) {
      console.log(`Error: Date out of term range`);
      return res.status(400).json({ 
        message: "Date must be within term period." 
      });
    }

    // Check weekend
    if (isWeekend(attendanceDate)) {
      console.log(`Error: Cannot mark attendance on weekends`);
      return res.status(400).json({ 
        message: "Cannot mark attendance on weekends." 
      });
    }

    // Check holiday
    const isHolidayDate = await isHoliday(attendanceDate, schoolId);
    if (isHolidayDate) {
      console.log(`Error: Cannot mark attendance on holidays`);
      return res.status(400).json({ 
        message: "Cannot mark attendance on holidays.",
        type: "holiday"
      });
    }

    // Check for existing records
    console.log(`Checking for existing attendance records for Class: ${className}, Date: ${date}...`);
    const normalizedDate = normalizeDate(attendanceDate);
    const existingRecords = await Attendance.find({ 
      termId, 
      classId,
      date: {
        $gte: new Date(normalizedDate + 'T00:00:00.000Z'),
        $lte: new Date(normalizedDate + 'T23:59:59.999Z')
      }
    });

    if (existingRecords.length > 0) {
      console.log(`Error: Attendance already recorded for Class: ${className} on Date: ${date}`);
      return res.status(400).json({ 
        message: "Attendance for this class on this date is already recorded." 
      });
    }

    console.log('Formatting batch attendance entries...');
    const attendanceEntries = attendanceList.map(({ studentId, present }) => ({
      studentId,
      termId,
      classId,
      date: attendanceDate,
      present,
    }));

    console.log('Inserting attendance records...');
    await Attendance.insertMany(attendanceEntries);

    console.log(`Attendance recorded successfully for all students in Class: ${className}`);

    return res.status(201).json({
      message: `Attendance recorded successfully for class "${className}".`,
      className,
      date: normalizedDate,
    });

  } catch (error) {
    console.error("❌ Error marking attendance batch:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// FETCH UNMARKED DATES (OPTIMIZED & FIXED)
// ============================

export const fetchUnmarkedDates = async (req, res) => {
  try {
    const { classId, termId } = req.query;

    console.log("📥 Incoming:", req.query);

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId are required." });
    }

    // 1️⃣ Get class + all student IDs
    const classDoc = await Class.findById(classId)
      .select("students school")
      .populate('school', '_id')
      .lean();

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }

    if (!classDoc.students || classDoc.students.length === 0) {
      return res.status(404).json({ message: "No students in this class." });
    }

    const studentIds = classDoc.students.map(s => s.toString());
    const schoolId = classDoc.school?._id || classDoc.school;
    
    console.log("👨‍👩‍👦 Total students in class:", studentIds.length);

    // 2️⃣ Load term
    const term = await TermSession.findById(termId).lean();
    if (!term) {
      return res.status(404).json({ message: "Term not found." });
    }

    const start = new Date(term.startDate);
    const end = new Date(term.endDate);
    const today = new Date();
    const effectiveEnd = end < today ? end : today;

    console.log("📅 Term Range:", start.toISOString(), "→", effectiveEnd.toISOString());

    // 3️⃣ Get all holidays in the term range (ONE query)
    const holidays = await getHolidaysInRange(start, effectiveEnd, schoolId);
    console.log("🏖️ Holidays found:", holidays.size);

    // 4️⃣ Generate all valid school days (Mon–Fri, excluding holidays)
    const validSchoolDays = [];
    const temp = new Date(start);

    while (temp <= effectiveEnd) {
      const day = temp.getDay();
      const dateStr = normalizeDate(temp);
      
      // Skip weekends and holidays
      if (day !== 0 && day !== 6 && !holidays.has(dateStr)) {
        validSchoolDays.push(dateStr);
      }
      temp.setDate(temp.getDate() + 1);
    }

    console.log("📘 Total valid school days:", validSchoolDays.length);

    // 5️⃣ Fetch ALL attendance records for ALL students in this class (ONE query)
    const attendanceRecords = await Attendance.find({
      studentId: { $in: studentIds },
      termId,
      date: {
        $gte: start,
        $lte: effectiveEnd
      }
    })
    .select('date studentId')
    .lean();

    console.log("📝 Total attendance records found:", attendanceRecords.length);

    // 6️⃣ Group attendance by date
    // A date is "marked" if at least ONE student has attendance for that date
    const markedDatesSet = new Set();
    
    attendanceRecords.forEach(record => {
      const dateStr = normalizeDate(record.date);
      markedDatesSet.add(dateStr);
    });

    console.log("✅ Unique dates with attendance:", markedDatesSet.size);

    // 7️⃣ Find unmarked dates (dates in validSchoolDays but not in markedDatesSet)
    const unmarkedDates = validSchoolDays.filter(date => !markedDatesSet.has(date));

    console.log("🚨 Unmarked dates count:", unmarkedDates.length);

    return res.status(200).json({
      totalSchoolDays: validSchoolDays.length,
      markedDays: markedDatesSet.size,
      unmarkedCount: unmarkedDates.length,
      unmarkedDates: unmarkedDates.map(d => new Date(d + 'T00:00:00.000Z').toISOString()),
      holidaysExcluded: holidays.size,
      debug: {
        studentsInClass: studentIds.length,
        attendanceRecordsFound: attendanceRecords.length
      }
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================
// FETCH ATTENDANCE
// ============================

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
      const normalizedDate = normalizeDate(date);
      query.date = {
        $gte: new Date(normalizedDate + 'T00:00:00.000Z'),
        $lte: new Date(normalizedDate + 'T23:59:59.999Z')
      };
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

// ============================
// UPDATE ATTENDANCE
// ============================

export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { present } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    attendance.present = present;
    await attendance.save();
    
    res.status(200).json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAttendance2 = async (req, res) => {
  const { termId, classId, date, attendanceList } = req.body;

  if (!termId || !classId || !date || !attendanceList) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const attendanceDate = new Date(date);
    
    // Check weekend
    if (isWeekend(attendanceDate)) {
      return res.status(400).json({ error: "Cannot mark attendance on weekends." });
    }

    // Get school ID from class
    const classDoc = await Class.findById(classId).select('school');
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found." });
    }

    // Check holiday
    const isHolidayDate = await isHoliday(attendanceDate, classDoc.school);
    if (isHolidayDate) {
      return res.status(400).json({ error: "Cannot mark attendance on holidays." });
    }

    const normalizedDate = normalizeDate(attendanceDate);
    const dateStart = new Date(normalizedDate + 'T00:00:00.000Z');
    const dateEnd = new Date(normalizedDate + 'T23:59:59.999Z');

    // Bulk update operations
    const bulkOperations = attendanceList.map(({ studentId, present }) => ({
      updateOne: {
        filter: { 
          studentId, 
          termId, 
          date: { $gte: dateStart, $lte: dateEnd }
        },
        update: { present, date: attendanceDate },
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

// ============================
// FETCH STUDENT ATTENDANCE (Updated with holidays)
// ============================

export const fetchStudentAttendance = async (req, res) => {
  try {
    const { termId, classId, viewBy = "term" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(termId)) {
      return res.status(400).json({ message: "Invalid term ID format." });
    }

    const term = await TermSession.findById(termId).populate('school');
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

    // Calculate range based on viewBy
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

    const schoolId = term.school?._id || term.school;
    const totalSchoolDays = await getSchoolDays(startDate, endDate, schoolId);

    let students;
    if (classId === "all") {
      students = await Students.find({ schoolId }).select("_id name idno feedingFee");
    } else {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid class ID format." });
      }
      students = await Students.find({ classes: classId }).select("_id name idno feedingFee");
    }

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this class." });
    }

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

// Continue with remaining functions (fetchTotalFeesBySchoolView, getFeedingDaily, etc.)
// They follow similar patterns with holiday checks where needed

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

    // View-based date range calculation (same as before)
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

// Feeding endpoints remain similar but can integrate holiday checks if needed
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


// ============================
// "TODAY" SNAPSHOTS (admin dashboard + teacher dashboard)
// ============================

// A class counts as "marked" when at least one of its students has a record on that day.
const buildTodaySnapshot = async (classes, dayString) => {
  const start = new Date(dayString + "T00:00:00.000Z");
  const end = new Date(dayString + "T23:59:59.999Z");

  const studentIds = [...new Set(classes.flatMap((c) => (c.students || []).map(String)))];
  const records = studentIds.length
    ? await Attendance.find({ studentId: { $in: studentIds }, date: { $gte: start, $lte: end } })
        .select("studentId present")
        .lean()
    : [];

  const marked = new Set(records.map((r) => String(r.studentId)));
  const present = records.filter((r) => r.present).length;

  return {
    date: dayString,
    isWeekend: isWeekend(dayString),
    present,
    absent: records.length - present,
    recorded: records.length,
    classesTotal: classes.length,
    classesMarked: classes.filter((c) => (c.students || []).some((s) => marked.has(String(s)))).length,
    classes: classes.map((c) => ({
      _id: c._id,
      className: c.className,
      marked: (c.students || []).some((s) => marked.has(String(s))),
    })),
  };
};

export const getSchoolAttendanceToday = async (req, res) => {
  try {
    const { schoolId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: "Invalid school id" });
    }
    if (req.user.role !== "superadmin" && String(req.user.schoolId) !== String(schoolId)) {
      return res.status(403).json({ message: "You can only view your own school." });
    }

    const day = normalizeDate(req.query.date || new Date());
    const [classes, totalStudents] = await Promise.all([
      Class.find({ school: schoolId }).select("className students").lean(),
      Students.countDocuments({ schoolId }),
    ]);

    const snapshot = await buildTodaySnapshot(classes, day);
    res.status(200).json({ ...snapshot, totalStudents });
  } catch (error) {
    console.error("Error building attendance snapshot:", error.message);
    res.status(500).json({ message: "Could not load attendance snapshot" });
  }
};

// The signed-in teacher's own classes (class teacher or subject teacher)
export const getMyAttendanceToday = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const day = normalizeDate(req.query.date || new Date());
    const classes = await Class.find({ $or: [{ teachers: teacherId }, { "subjects.teachers": teacherId }] })
      .select("className students")
      .lean();
    res.status(200).json(await buildTodaySnapshot(classes, day));
  } catch (error) {
    console.error("Error building teacher attendance snapshot:", error.message);
    res.status(500).json({ message: "Could not load attendance snapshot" });
  }
};
