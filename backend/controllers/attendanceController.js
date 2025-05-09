import Attendance from "../models/Attendance.model.js";
import TermSession from "../models/TermSession.model.js";
import Students from "../models/Student.model.js";

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
    try {
      const { termId, date, attendanceList } = req.body;
  
      // Validate term session
      const term = await TermSession.findById(termId);
      if (!term) return res.status(404).json({ message: "Term session not found." });
  
      const attendanceDate = new Date(date);
      if (attendanceDate < term.startDate || attendanceDate > term.endDate || isWeekend(attendanceDate)) {
        return res.status(400).json({ message: "Invalid attendance date (must be within term and not on weekends)." });
      }
  
      // Prevent duplicate attendance for the same date
      const existingRecords = await Attendance.find({ termId, date });
      if (existingRecords.length > 0) {
        return res.status(400).json({ message: "Attendance for this date is already recorded." });
      }
  
      // Format batch attendance entries
      const attendanceEntries = attendanceList.map(({ studentId, present }) => ({
        studentId,
        termId,
        date,
        present,
      }));
  
      // Insert multiple entries at once
      await Attendance.insertMany(attendanceEntries);
  
      res.status(201).json({ message: "Attendance recorded successfully for all students." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// FETCH ATTENDANCE (by class, student, or term)
export const fetchAttendance = async (req, res) => {
    try {
      const { termId, studentId, classId, date } = req.query;
  
      let query = {};
      if (termId) query.termId = termId;
      if (studentId) query.studentId = studentId;
      if (classId) {
        const students = await Students.find({ classes: classId }).select("_id");
        query.studentId = { $in: students.map((s) => s._id) };
      }
      if (date) query.date = date; // ✅ Filter attendance by date
  
      const attendanceRecords = await Attendance.find(query)
        .populate("studentId", "name idno")
        .populate("termId", "termName");
  
      res.status(200).json(attendanceRecords);
    } catch (error) {
      res.status(500).json({ error: error.message });
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