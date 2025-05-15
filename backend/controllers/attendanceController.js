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

 

export const markAttendanceBatch = async (req, res) => {
    console.log(`Marking attendance batch for Term ID: ${req.body.termId}, Date: ${req.body.date}`);

    try {
        const { termId, date, attendanceList, classId, teacherEmail, teacherId } = req.body; // ✅ Now receiving teacherId from frontend

       
        console.log(`Fetching class details for Class ID: ${classId}...`);
        const classData = await Class.findById(classId);
        if (!classData) {
            console.log(`Error: Class not found for Class ID: ${classId}`);
            return res.status(404).json({ message: "Class not found." });
        }

        const className = classData.className; // ✅ Extract class name
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
        
         if (!teacherEmail || !teacherId) { // ✅ Validate both teacherEmail & teacherId
            console.log('Error: Teacher email or ID not provided.');
            return res.status(400).json({ message: "Teacher email and ID are required." });
        }

        // **Send confirmation email to the teacher**
        console.log(`📧 Preparing to send email to: ${teacherEmail}...`);

        try {
            const emailMessage = `
                Dear Teacher,  
                
                You have successfully submitted attendance for your class on **${date}**.  
                
                Thank you for your time and dedication.  
                
                Best regards,  
                **School Management Team**
            `;

            const emailResponse = await sendMail(
                teacherEmail,
                "Attendance Submission Confirmation",
                emailMessage // ✅ Use formatted message
            );

            console.log(`✅ Email sent successfully! Response: ${JSON.stringify(emailResponse, null, 2)}`);
            res.status(201).json({ message: `Attendance recorded successfully for class "${className}", and email sent to the teacher.` });

            // ✅ Trigger notification for the teacher using received `teacherId`
            await createNotification(
                [], // No users (admins) in this case
                [teacherId], // ✅ Use received teacherId from frontend
                "Attendance Successfully Recorded",
                `Attendance for ${className} on ${date} has been successfully recorded.`,
                "attendance"
            );

        } catch (emailError) {
            console.error("❌ Error sending email:", emailError);
            res.status(500).json({ message: `Attendance recorded for class "${className}", but email sending failed.` });
        }

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

