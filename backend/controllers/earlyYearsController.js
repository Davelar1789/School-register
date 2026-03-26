// controllers/earlyYearsController.js
import EarlyYearsReport from "../models/EarlyYearsReport.model.js";
import Students from "../models/Student.model.js";

/**
 * GET /api/grades/early-years?classId=...&termId=...
 * Returns all students in the class, with their saved ticks (if any)
 */
export const getEarlyYearsReport = async (req, res) => {
  try {
    const { classId, termId } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "Missing classId or termId" });
    }

    console.log(`🌱 Fetching early-years students for class ${classId}, term ${termId}`);

    // Get all students enrolled in this class
    const students = await Students.find({ classes: classId }).select("_id name");

    if (!students.length) {
      console.log("⚠️ No students found for this class.");
      return res.json([]);
    }

    // Get any saved reports for these students this term
    const reports = await EarlyYearsReport.find({ classId, termId });

    // Build a map for quick lookup: studentId -> ticks object
    const reportMap = {};
    for (const report of reports) {
      // Convert Mongoose Map to plain object before sending
      reportMap[report.studentId.toString()] = Object.fromEntries(report.ticks);
    }

    // Merge students with their saved ticks
    const result = students.map((student) => ({
      studentId: student._id,
      name: student.name,
      ticks: reportMap[student._id.toString()] || {},
    }));

    console.log(`✅ Returning ${result.length} students with early-years data.`);
    res.json(result);
  } catch (error) {
    console.error("🚨 Failed to fetch early-years report:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/grades/early-years
 * Body: { classId, termId, reports: [{ studentId, ticks: { activity: rating } }] }
 * Upserts one report document per student
 */
export const saveEarlyYearsReport = async (req, res) => {
  try {
    const { classId, termId, reports } = req.body;
    const teacherId = req.user._id;

    if (!classId || !termId || !Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({ message: "Missing classId, termId, or reports array" });
    }

    const VALID_RATINGS = ["Excellent", "Very Good", "Good", "Needs Improvement"];

    console.log(`🌱 Saving early-years reports for ${reports.length} students...`);

    for (const entry of reports) {
      const { studentId, ticks } = entry;

      if (!studentId) {
        console.warn("⚠️ Skipping entry with missing studentId");
        continue;
      }

      // Validate all tick values before saving
      for (const [activity, rating] of Object.entries(ticks || {})) {
        if (!VALID_RATINGS.includes(rating)) {
          return res.status(400).json({
            message: `Invalid rating "${rating}" for activity "${activity}". Must be one of: ${VALID_RATINGS.join(", ")}`,
          });
        }
      }

      await EarlyYearsReport.findOneAndUpdate(
        { studentId, classId, termId },
        {
          studentId,
          classId,
          termId,
          ticks,
          createdBy: teacherId,
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Saved report for student ${studentId}`);
    }

    console.log("🎯 All early-years reports saved successfully.");
    res.json({ message: "Early years reports saved successfully" });
  } catch (error) {
    console.error("🚨 Failed to save early-years reports:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
