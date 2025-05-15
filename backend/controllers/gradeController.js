// controllers/gradeController.js
import GradeEntry from "../models/Grade.model.js";
import Students from "../models/Student.model.js";
import TermSession from "../models/TermSession.model.js";

// Helper to get 1st, 2nd, 3rd...
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const getStudentGrades = async (req, res) => {
  try {
    console.log("Fetching student grades...");
    console.log("Request query:", req.query);

    const { classId, subjectId, termId } = req.query;
    if (!classId || !subjectId || !termId) {
      console.error("Missing class, subject, or term ID");
      return res.status(400).json({ message: "Missing class, subject or term ID" });
    }

    console.log(`Getting students in class ${classId}...`);
    const students = await Students.find({ classes: classId }).select("_id name");
    console.log(`Found ${students.length} students in class ${classId}`);

    console.log(`Getting grade entries for class ${classId}, subject ${subjectId}, and term ${termId}...`);
    const gradeEntries = await GradeEntry.find({ classId, subjectId, termId });
    console.log(`Found ${gradeEntries.length} grade entries`);

    console.log("Matching grades to students...");
    const result = students.map((student) => {
      const entry = gradeEntries.find((g) => g.studentId.toString() === student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        scores: entry?.scores || {
          test1: 0,
          test2: 0,
          test3: 0,
          test4: 0,
          exam: 0,
          total: 0,
          position: "",
        },
      };
    });
    console.log("Student grades fetched successfully!");

    res.json(result);
  } catch (error) {
    console.error("Failed to fetch student grades:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};



export const saveStudentGrades = async (req, res) => {
  try {
    const { classId, subjectId, termId, grades } = req.body;
    const teacherId = req.user._id;

    if (!classId || !subjectId || !termId || !grades) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // First, calculate totals
    const enrichedGrades = grades.map((grade) => {
      const total =
        (grade.scores.test1 || 0) +
        (grade.scores.test2 || 0) +
        (grade.scores.test3 || 0) +
        (grade.scores.test4 || 0) +
        (grade.scores.exam || 0);

      return {
        ...grade,
        total: Math.round(total),
      };
    });

    // Sort by total descending
    enrichedGrades.sort((a, b) => b.total - a.total);

    // Assign positions
    enrichedGrades.forEach((grade, index) => {
      grade.scores.position = getOrdinal(index + 1); // e.g., "1st", "2nd"
      grade.scores.total = grade.total;
    });

    // Save all grades
    for (const grade of enrichedGrades) {
      const { studentId, scores } = grade;

      await GradeEntry.findOneAndUpdate(
        {
          studentId,
          classId,
          subjectId,
          termId,
        },
        {
          studentId,
          classId,
          subjectId,
          termId,
          scores,
          createdBy: teacherId,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Grades and positions saved successfully" });
  } catch (error) {
    console.error("Failed to save grades:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};