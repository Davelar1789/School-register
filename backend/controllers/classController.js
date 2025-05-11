// controllers/classController.js
import Class from "../models/Class.model.js";
import Students from "../models/Student.model.js"; // ✅ Add this
import Teacher from "../models/Teacher.model.js"; // ✅ Also recommended
import School from "../models/School.model.js";
import Subject from "../models/subject.model.js"; // make sure this is the right path

// Create a new class
export const createClass = async (req, res) => {
  try {
    const { school, className, description, level, teachers = [], students = [] } = req.body;

    if (!school || !className || !level) {
      return res.status(400).json({ message: "school, className, and level are required" });
    }

    // Prevent duplicate className in same school
    const existing = await Class.findOne({ school, className });
    if (existing) {
      return res.status(400).json({ message: "Class with this name already exists for this school" });
    }

    const newClass = new Class({
      school,
      className,
      description,
      level,
      teachers,
      students,
    });

    await newClass.save();

    // 🔥 UPDATE the number of classes for the school
    const numberOfClasses = await Class.countDocuments({ school });
    await School.findByIdAndUpdate(school, { numberOfClasses });

    res.status(201).json(newClass);
  } catch (err) {
    console.error("Error creating class:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all classes for a school
export const getClassesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const classes = await Class.find({ school: schoolId })
    .populate({ path: "teachers", select: "name" })
    .populate({ path: "students", model: "students", select: "name" });
  

    res.status(200).json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const assignTeacherToClass = async (req, res) => {
  const { teacherId, classId } = req.body;

  try {
    // Step 1: Add class to teacher's assigned classes
    await Teacher.findByIdAndUpdate(
      teacherId,
      { $addToSet: { classesAssigned: classId } },
      { new: true }
    );

    // Step 2: Add teacher to class's teacher list
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { teachers: teacherId } },
      { new: true }
    );

    res.status(200).json({ message: 'Teacher successfully assigned to class' });
  } catch (error) {
    console.error('Error assigning teacher to class:', error);
    res.status(500).json({ error: 'Something went wrong while assigning teacher to class' });
  }
};

export const assignStudentToClass = async (req, res) => {
  const { studentId, classId } = req.body;

  try {
    // Step 1: Add class ID to student's class array (optional if you store full array)
    await Students.findByIdAndUpdate(
      studentId,
      { $addToSet: { classes: classId } }, // Or update another field if needed
      { new: true }
    );

    // Step 2: Add student to class's students array
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: studentId } },
      { new: true }
    );

    res.status(200).json({ message: "Student successfully assigned to class" });
  } catch (error) {
    console.error("Error assigning student to class:", error);
    res.status(500).json({ error: "Something went wrong while assigning student to class" });
  }
};

export const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate({ path: "teachers", select: "name" })
      .populate({ path: "students", model: "students", select: "name idno" });

    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(classItem);
  } catch (err) {
    console.error("Error fetching class by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const patchStudentClasses = async (req, res) => {
  try {
    // 1. Get all classes
    const classes = await Class.find({});

    for (const eachClass of classes) {
      const { _id: classId, students } = eachClass;

      for (const studentId of students) {
        // 2. For each student, add the classId into their classes array
        await Students.findByIdAndUpdate(
          studentId,
          { $addToSet: { classes: classId } }, // ✅ No duplicates because $addToSet
          { new: true }
        );
      }
    }

    res.status(200).json({ message: "Successfully patched all students" });
  } catch (error) {
    console.error("Error patching students:", error);
    res.status(500).json({ error: "Something went wrong during patching" });
  }
};

export const recalculateClassesForSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const numberOfClasses = await Class.countDocuments({ school: schoolId });
    school.numberOfClasses = numberOfClasses;
    await school.save();

    res.status(200).json({ message: "Number of classes updated successfully", school });
  } catch (error) {
    console.error("Error recalculating number of classes:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSubjectsByClass = async (req, res) => {
  const { id: classId } = req.params;

  try {
    const subjects = await Subject.find({ classes: classId }).select("name _id");

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects for class:", error);
    res.status(500).json({ message: "Failed to fetch subjects for this class" });
  }
};

export const assignSubjectTeacher = async (req, res) => {
  const { teacherId, classId, subjectIds } = req.body;

  if (!teacherId || !classId || !subjectIds || subjectIds.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Find the class
    const schoolClass = await Class.findById(classId);
    if (!schoolClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Fetch all subjects in this school that include this class
    const classSubjects = await Subject.find({
      _id: { $in: subjectIds },
      classes: classId
    });

    classSubjects.forEach((subjectDoc) => {
      const existing = schoolClass.subjects.find((sub) =>
        sub.subject.toString() === subjectDoc._id.toString()
      );

      if (existing) {
        if (!existing.teachers.includes(teacherId)) {
          existing.teachers.push(teacherId);
        }
      } else {
        schoolClass.subjects.push({
          subject: subjectDoc._id,
          teachers: [teacherId],
        });
      }
    });

    await schoolClass.save();

    return res.status(200).json({ message: "Subjects assigned successfully" });
  } catch (error) {
    console.error("Error assigning subject-teacher:", error);
    return res.status(500).json({ message: "Server error while assigning subjects" });
  }
};

// ✅ Update total feeding paid for a class
export const updateTotalFeedingPaid = async (req, res) => {
  const { classId } = req.params;
  const { totalFeedingPaid } = req.body;

  try {
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ✅ Update feeding total
    classToUpdate.totalFeedingPaid = totalFeedingPaid;
    await classToUpdate.save();

    res.status(200).json({
      message: "Total feeding paid updated successfully",
      totalFeedingPaid,
    });
  } catch (error) {
    console.error("Error updating total feeding paid:", error);
    res.status(500).json({ message: "Server error updating total feeding paid" });
  }
};

export const getTotalFeedingPaid = async (req, res) => {
  const { schoolId } = req.params;

  try {
    // ✅ Find all classes belonging to this school and sum the `totalFeedingPaid`
    const totalFeedingPaid = await Class.aggregate([
      { $match: { school: schoolId } }, // Filter by school ID
      { $group: { _id: null, total: { $sum: "$totalFeedingPaid" } } } // Sum feeding fees
    ]);

    res.status(200).json({
      message: "Total feeding paid fetched successfully",
      totalFeedingPaid: totalFeedingPaid.length ? totalFeedingPaid[0].total : 0, // Return total or 0 if no classes found
    });
  } catch (error) {
    console.error("Error fetching total feeding paid:", error);
    res.status(500).json({ message: "Server error fetching total feeding paid" });
  }
};
