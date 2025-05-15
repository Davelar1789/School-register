// controllers/gradeController.js
import GradeEntry from "../models/Grade.model.js";
import Students from "../models/Student.model.js";
import TermSession from "../models/TermSession.model.js";

export const getStudentGrades = async (req, res) => {
  try {
    const { classId, subjectId, termId } = req.query;

    if (!classId || !subjectId || !termId) {
      return res.status(400).json({ message: "Missing class, subject or term ID" });
    }

    // Get students in the class
    const students = await Students.find({ classes: classId }).select("_id name");

    // Get existing grade entries
    const gradeEntries = await GradeEntry.find({
      classId,
      subjectId,
      termId,
    });

    // Match grades to students (or provide default structure)
    const result = students.map(student => {
      const entry = gradeEntries.find(g => g.studentId.toString() === student._id.toString());

      return {
        studentId: student._id,
        name: student.name,
        scores: entry?.scores || {
          test1: 0, test2: 0, test3: 0, test4: 0, exam: 0, total: 0, position: 0
        }
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Failed to fetch student grades:", error.message);
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

    for (const grade of grades) {
      const { studentId, scores } = grade;

      const total =
        (scores.test1 || 0) +
        (scores.test2 || 0) +
        (scores.test3 || 0) +
        (scores.test4 || 0) +
        (scores.exam || 0);

      await GradeEntry.findOneAndUpdate(
        {
          studentId,
          classId,
          subjectId,
          termId
        },
        {
          studentId,
          classId,
          subjectId,
          termId,
          scores: {
            ...scores,
            total,
          },
          createdBy: teacherId
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Grades saved successfully" });
  } catch (error) {
    console.error("Failed to save grades:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
