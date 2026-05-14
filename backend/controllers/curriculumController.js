// curriculumController.js
// Add these to your existing teacher controller file, or a new curriculumController.js

import Class from "../models/Class.model.js";
import Teacher from "../models/Teacher.model.js";
// import Curriculum from "../models/Curriculum.model.js"; // uncomment when you have this model


/**
 * GET /api/teachers/:teacherId/subjects2?classId=...
 *
 * Returns subjects for a teacher scoped to a specific class, respecting teacherType:
 *
 * - Class Teacher   → all subjects of that class (classId required)
 * - Subject Teacher → only subjects the teacher is assigned to in that class
 * - Both            → only subjects the teacher is assigned to (NOT all class subjects)
 */
export const getTeacherSubjectsForClass = async (req, res) => {
  const { teacherId } = req.params;
  const { classId } = req.query;

  if (!classId) {
    return res.status(400).json({ message: "classId query param is required." });
  }

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const cls = await Class.findById(classId)
      .populate("subjects.subject", "name")
      .select("className level subjects");

    if (!cls) {
      return res.status(404).json({ message: "Class not found." });
    }

    let subjects = [];

    if (teacher.teacherType === "Class Teacher") {
      // Return ALL subjects of the class
      subjects = cls.subjects.map((sub) => ({
        subjectId: sub.subject?._id,
        subjectName: sub.subject?.name || "Unknown",
        classId: cls._id,
        className: cls.className,
        level: cls.level,
      }));

    } else if (
      teacher.teacherType === "Subject Teacher" ||
      teacher.teacherType === "Both"
    ) {
      // Return ONLY subjects the teacher is assigned to in this class
      subjects = cls.subjects
        .filter((sub) =>
          sub.teachers.map((t) => t.toString()).includes(teacherId.toString())
        )
        .map((sub) => ({
          subjectId: sub.subject?._id,
          subjectName: sub.subject?.name || "Unknown",
          classId: cls._id,
          className: cls.className,
          level: cls.level,
        }));

    } else {
      return res.status(400).json({ message: "Unsupported teacher type." });
    }

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error("Error fetching teacher subjects for class:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


/**
 * GET /api/curriculum/:subjectId/:classId
 *
 * Returns the curriculum for a given subject + class combination.
 * Adjust this based on your Curriculum model structure.
 */
export const getCurriculum = async (req, res) => {
  const { subjectId, classId } = req.params;

  try {
    // Uncomment and adjust once you have a Curriculum model:
    // const curriculum = await Curriculum.findOne({ subject: subjectId, class: classId });
    // if (!curriculum) {
    //   return res.status(404).json({ message: "Curriculum not found.", curriculum: null });
    // }
    // return res.status(200).json({ curriculum });

    // Placeholder response until Curriculum model is ready:
    return res.status(200).json({
      curriculum: null, // Replace with real data
    });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return res.status(500).json({ message: "Server error." });
  }
};