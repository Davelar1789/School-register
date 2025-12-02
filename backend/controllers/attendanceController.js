import Attendance from "../models/Attendance.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from '../models/Class.model.js'; // ✅ Import the Class model
import Students from "../models/Student.model.js";
import mongoose from "mongoose";
import { createNotification } from "../controllers/NotificationController.js";
import { sendMail } from './mailerController.js';

// Helper function to check if a date is a weekend
const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

// MARK ATTENDANCE
export const markAttendance = async (req, res) => {
    try {
      const { studentId, termId, date, present } = req.body;
  
      // Validate date against term session
      const term = await TermSession.findById(termId);
      if (!term) return res.status(404).json({ message: "Term session not found." });
  
      const attendanceDate = new Date(date);
      if (attendanceDate < term.startDate || attendanceDate > term.endDate || isWeekend(attendanceDate)) {
        return res.status(400).json({ message: "Invalid attendance date (must be within term and not on weekends)." });
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


export const markAttendanceBatch = async (req, res) => {
  console.log(`Marking attendance batch for Term ID: ${req.body.termId}, Date: ${req.body.date}`);

  try {
    const { termId, date, attendanceList, classId } = req.body;

    console.log(`Fetching class details for Class ID: ${classId}...`);
    const classData = await Class.findById(classId);
    if (!classData) {
      console.log(`Error: Class not found for Class ID: ${classId}`);
      return res.status(404).json({ message: "Class not found." });
    }

    const className = classData.className;
    console.log(`Class name found: ${className}`);

    console.log(`Validating term session for Term ID: ${termId}...`);
    const term = await TermSession.findById(termId);
    if (!term) {
      console.log(`Error: Term session not found for Term ID: ${termId}`);
      return res.status(404).json({ message: "Term session not found." });
    }

    const attendanceDate = new Date(date);
    console.log(`Attendance date parsed: ${attendanceDate}`);

    if (attendanceDate < term.startDate || attendanceDate > term.endDate || isWeekend(attendanceDate)) {
      console.log(`Error: Invalid attendance date (${attendanceDate}) - Out of term range or weekend.`);
      return res.status(400).json({ message: "Invalid attendance date (must be within term and not on weekends)." });
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

    // ✅ FIX: Send response
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

  

export const fetchAttendance = async (req, res) => {
    try {
        const { termId, studentId, classId, date } = req.query;

        // ✅ Log received parameters
        // console.log("Received Query Params:", { termId, studentId, classId, date });

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

        // console.log("Final Query Object:", query);

        const attendanceRecords = await Attendance.find(query)
            .populate({
                path: "studentId",
                model: "students", // ✅ Explicitly reference registered model name
                select: "name idno"
            })
            .populate("termId", "termName");

        // console.log("Fetched Attendance Records:", attendanceRecords.length);

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance records:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// UPDATE ATTENDANCE (Optional)
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


export const fetchStudentAttendance = async (req, res) => {
  try {
    const { termId, classId, viewBy = "term" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(termId)) {
      return res.status(400).json({ message: "Invalid term ID format." });
    }

    // Ensure term session exists
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

    // Calculate range based on `viewBy`
    switch (viewBy) {
      case "today":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;

      case "week": {
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(today);
        startDate.setDate(today.getDate() + mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 4); // Monday to Friday
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
        // already set to term start - today
        break;
    }

    // Helper: Count valid school days (Mon-Fri) in the range
    const getSchoolDays = (start, end) => {
      let count = 0;
      let current = new Date(start);
      while (current <= end) {
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    const totalSchoolDays = getSchoolDays(startDate, endDate);

    let students;

    if (classId === "all") {
      students = await Students.find({}).select("_id name idno feedingFee");
    } else {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid class ID format." });
      }

      students = await Students.find({ classes: classId }).select("_id name idno feedingFee");
    }

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this class." });
    }

    // Fetch attendance for each student in the selected range
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

    // View-based date range calculation
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

    // Get all students in the school
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




export const getFeedingDaily = async (req, res) => {
  try {
    const { termId, classId, date } = req.query;
    if (!termId || !classId || !date) {
      return res.status(400).json({ message: "Missing termId, classId, or date" });
    }

    const targetDate = new Date(date);
    const students = await Students.find({ classId }).select("name idno");

    // Map attendance records
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

// Update attendance for a specific class and date
export const updateAttendance2 = async (req, res) => {
  const { termId, classId, date, attendanceList } = req.body;

  if (!termId || !classId || !date || !attendanceList) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const attendanceDate = new Date(date);
    if ([0, 6].includes(attendanceDate.getDay())) {
      return res.status(400).json({ error: "Cannot mark attendance on weekends." });
    }

    // Loop through the list and update each student's attendance
    const bulkOperations = attendanceList.map(({ studentId, present }) => ({
      updateOne: {
        filter: { studentId, termId, date: attendanceDate },
        update: { present },
        upsert: true, // create if not found
      },
    }));

    await Attendance.bulkWrite(bulkOperations);

    res.status(200).json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ error: "Server error updating attendance." });
  }
};


export const fetchUnmarkedDates = async (req, res) => {
  try {
    const { termId, classId } = req.query;
    console.log("🔍 Incoming Request:", { termId, classId });

    if (!termId || !classId) {
      return res.status(400).json({ message: "termId and classId are required." });
    }

    // Validate ObjectId shapes if possible
    try {
      const mongoose = (await import("mongoose")).default;
      console.log("🧩 Valid ObjectId(termId)?", mongoose.Types.ObjectId.isValid(termId));
      console.log("🧩 Valid ObjectId(classId)?", mongoose.Types.ObjectId.isValid(classId));
    } catch (e) {
      console.log("⚠️ Couldn't check ObjectId validity (mongoose import failed):", e.message);
    }

    // Load term
    const term = await TermSession.findById(termId);
    if (!term) {
      console.log("❌ Term not found for id:", termId);
      return res.status(404).json({ message: "Term session not found." });
    }

    const start = new Date(term.startDate);
    const end = new Date(term.endDate);
    console.log("📅 Term Range:", { start: start.toISOString(), end: end.toISOString() });

    // Generate all valid school days (Mon–Fri)
    const getValidSchoolDates = () => {
      const dates = [];
      let current = new Date(start);
      // normalize time-of-day to midnight UTC to be consistent
      current.setUTCHours(0, 0, 0, 0);
      const last = new Date(end);
      last.setUTCHours(0, 0, 0, 0);

      while (current <= last) {
        const day = current.getUTCDay(); // 0 = Sun, 6 = Sat
        if (day !== 0 && day !== 6) {
          dates.push(new Date(current)); // push copy
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
      return dates;
    };

    const validDates = getValidSchoolDates();
    console.log("📘 Total Valid School Dates:", validDates.length);

    // Helper to convert Date -> YYYY-MM-DD (UTC)
    const toISODateOnly = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return null;
      // Use UTC so timezone won't shift date across boundaries
      const yyyy = dt.getUTCFullYear();
      const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(dt.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    // FIRST: try the precise query (fast path)
    console.log("🔎 Running initial direct query (classId + termId + date range) ...");
    let attendanceRecords = await Attendance.find({
      classId,
      termId,
      date: { $gte: start, $lte: end }
    }).select("date termId classId");

    console.log("📝 Direct Query result count:", attendanceRecords.length);

    // If direct query returned zero, probe further (some systems store date as string or termId missing)
    if (!attendanceRecords.length) {
      console.log("🔍 Direct query returned 0 — probing with broader queries to find where data lives...");

      // 1) Find any attendance for this class (ignore term/date) - to check if classId linkage exists
      const byClass = await Attendance.find({ classId }).limit(10).select("date termId classId");
      console.log("🧾 Any attendance docs with this classId? count:", byClass.length);
      byClass.forEach((d, i) =>
        console.log(`   sample-byClass[${i}]: date=${d.date} | termId=${d.termId} | classId=${d.classId}`)
      );

      // 2) Find any attendance docs for this term (ignore class/date) - to check term linkage
      const byTerm = await Attendance.find({ termId }).limit(10).select("date termId classId");
      console.log("📚 Any attendance docs with this termId? count:", byTerm.length);
      byTerm.forEach((d, i) =>
        console.log(`   sample-byTerm[${i}]: date=${d.date} | termId=${d.termId} | classId=${d.classId}`)
      );

      // 3) Find docs for this class where date exists (could be string dates). We'll fetch a few
      const byClassWithDate = await Attendance.find({ classId, date: { $exists: true } }).limit(50).select("date termId classId");
      console.log("🔎 classId with any date field (count):", byClassWithDate.length);
      byClassWithDate.forEach((d, i) =>
        console.log(`   sample-classWithDate[${i}]: typeof(date)=${typeof d.date} | value=${d.date} | toISO=${toISODateOnly(d.date)} | termId=${d.termId}`)
      );

      // Use that broader set (class-limited) to compute marked days (fallback)
      attendanceRecords = byClassWithDate;
    }

    // Build a robust set of marked yyyy-mm-dd strings
    const markedDateStrings = new Set();
    attendanceRecords.forEach((rec, i) => {
      // attempt to get a normalized ISO date-only string
      const iso = toISODateOnly(rec.date);
      if (iso) {
        markedDateStrings.add(iso);
      } else if (typeof rec.date === "string") {
        // If stored exactly as 'YYYY-MM-DD' (common), use it
        const s = rec.date.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) markedDateStrings.add(s);
      }
      // Also consider the possibility termId is missing in rec (we'll optionally check)
      console.log(`   record[${i}] rawDate=${rec.date} -> iso=${iso} | termId=${rec.termId}`);
    });

    console.log("📌 Marked Dates (normalized YYYY-MM-DD) count:", markedDateStrings.size);
    console.log(markedDateStrings);

    // Now compute unmarked dates by comparing normalized date-only strings
    const unmarkedDates = [];
    validDates.forEach((d) => {
      const iso = toISODateOnly(d);
      const isMarked = markedDateStrings.has(iso);
      if (!isMarked) unmarkedDates.push(d.toISOString()); // return ISO so frontend behavior unchanged

      console.log(`⛔ Check Date ${iso} -> marked? ${isMarked ? "YES" : "NO"}`);
    });

    console.log("🚨 Unmarked Dates Count:", unmarkedDates.length);

    return res.status(200).json({
      totalSchoolDays: validDates.length,
      markedDays: validDates.length - unmarkedDates.length,
      unmarkedCount: unmarkedDates.length,
      unmarkedDates,
    });

  } catch (error) {
    console.error("❌ Error fetching unmarked date list:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

