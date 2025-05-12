import Attendance from "../models/Attendance.model.js";
import TermSession from "../models/TermSession.model.js";
import Students from "../models/Student.model.js";
import mongoose from "mongoose";
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
        const { termId, date, attendanceList, classId, teacherEmail } = req.body; // ✅ Receive teacher's email from frontend

        if (!teacherEmail) {
            console.log('Error: Teacher email not provided.');
            return res.status(400).json({ message: "Teacher email is required." });
        }

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

        console.log(`Checking for existing attendance records for Class ID: ${classId}, Date: ${date}...`);
        const existingRecords = await Attendance.find({ termId, classId, date });
        if (existingRecords.length > 0) {
            console.log(`Error: Attendance already recorded for Class ID: ${classId} on Date: ${date}`);
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

        console.log(`Attendance recorded successfully for all students in Class ID: ${classId}`);

        // **Send confirmation email to the teacher**
        console.log(`Preparing to send email to: ${teacherEmail}...`);

        try {
            const emailResponse = await sendMail(
                teacherEmail,
                "Attendance Submitted",
                `Attendance for Class ID: ${classId} on ${date} has been successfully recorded.`
            );

            console.log(`✅ Email sent successfully: ${JSON.stringify(emailResponse)}`);
            return res.status(201).json({ message: "Attendance recorded successfully and email sent to the teacher." });

        } catch (emailError) {
            console.error("❌ Error sending email:", emailError);
            return res.status(500).json({ message: "Attendance recorded, but email sending failed." });
        }

    } catch (error) {
        console.error("❌ Error marking attendance batch:", error);
        return res.status(500).json({ error: error.message });
    }
};

  

export const fetchAttendance = async (req, res) => {
    try {
        const { termId, studentId, classId, date } = req.query;

        // ✅ Log received parameters
        console.log("Received Query Params:", { termId, studentId, classId, date });

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

        console.log("Final Query Object:", query);

        const attendanceRecords = await Attendance.find(query)
            .populate({
                path: "studentId",
                model: "students", // ✅ Explicitly reference registered model name
                select: "name idno"
            })
            .populate("termId", "termName");

        console.log("Fetched Attendance Records:", attendanceRecords.length);

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
      const { termId, classId, date } = req.query;

      if (!mongoose.Types.ObjectId.isValid(termId)) {
        return res.status(400).json({ message: "Invalid term ID format." });
      }
      
      
      // Ensure term session exists
      const term = await TermSession.findById(termId);
      if (!term) return res.status(404).json({ message: "Term session not found." });
  
      // Calculate total school days from term start to today (excluding weekends)
      const getSchoolDays = (startDate, endDate) => {
        let totalDays = 0;
        let currentDate = new Date(startDate);
  
        while (currentDate <= endDate) {
          if (![0, 6].includes(currentDate.getDay())) { // Exclude weekends
            totalDays++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return totalDays;
      };
  
      const today = date ? new Date(date) : new Date();
      const totalSchoolDays = getSchoolDays(term.startDate, today);
  
      // Find students in the selected class
      const students = await Students.find({ classes: classId }).select("_id name idno");
      if (!students.length) {
        console.warn("No students found for class:", classId);
        return res.status(404).json({ message: "No students found for this class." });
      }
  
      // Fetch attendance for each student
      const studentAttendance = await Promise.all(
        students.map(async (student) => {
          const attendanceCount = await Attendance.countDocuments({ 
            studentId: student._id, 
            termId, 
            present: true 
          });
  
          return {
            _id: student._id,
            name: student.name,
            idno: student.idno,
            totalPresentDays: attendanceCount,
            totalSchoolDays
          };
        })
      );
  
      res.status(200).json(studentAttendance);
      
    } catch (error) {
      console.error("Error fetching student attendance:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };