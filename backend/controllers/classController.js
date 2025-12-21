// controllers/classController.js
import Class from "../models/Class.model.js";
import Students from "../models/Student.model.js"; // ✅ Add this
import Teacher from "../models/Teacher.model.js"; // ✅ Also recommended
import School from "../models/School.model.js";
import Subject from "../models/subject.model.js"; // make sure this is the right path
import mongoose from "mongoose";

function generateClassName(level, number) {
  switch (level) {
    case "Creche":
      return "Creche";
    case "Nursery":
      return `Nursery ${number}`;
    case "Kindergaten":
      return `KG ${number}`;
    case "Primary":
      return `Basic ${number}`;
    case "Junior High":
      return `JHS ${number}`;
    case "Senior High":
      return `SHS ${number}`;
    default:
      throw new Error("Invalid level or number");
  }
}


// Create a new class
export const createClass = async (req, res) => {
  try {
    const { school, description, level, number, teachers = [], students = [] } = req.body;

    if (!school || !level) {
      return res.status(400).json({ message: "school and level are required" });
    }

    // For levels that require a number
    const requiresNumber = ["Nursery", "Kindergaten", "Primary", "Junior High", "Senior High"];
    if (requiresNumber.includes(level) && !number) {
      return res.status(400).json({ message: `Number is required for ${level}` });
    }

    const className = generateClassName(level, number);

    // Prevent duplicate className in the same school
    const existing = await Class.findOne({ school, className });
    if (existing) {
      return res.status(400).json({ message: "Class with this name already exists for this school" });
    }

    const newClass = new Class({
      school,
      className,
      level,
      number,
      description,
      teachers,
      students,
    });

    await newClass.save();

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
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // ❌ Subject-only teachers cannot be class teachers
    if (teacher.teacherType === "Subject Teacher") {
      return res.status(400).json({
        message: "Subject Teachers cannot be assigned as Class Teachers"
      });
    }

    // ✅ Add class to teacher (CLASS TEACHER ONLY)
    await Teacher.findByIdAndUpdate(
      teacherId,
      { $addToSet: { classesAssigned: classId } }
    );

    // ✅ Add teacher to class
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { teachers: teacherId } }
    );

    res.json({ message: "Class teacher assigned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign class" });
  }
};


export const assignSubjectTeacher2 = async (req, res) => {
  const { teacherId, classId, subjectIds } = req.body;

  try {
    const teacher = await Teacher.findById(teacherId);
    const classDoc = await Class.findById(classId);

    if (!teacher || !classDoc) {
      return res.status(404).json({ message: "Teacher or Class not found" });
    }

    // ❌ Prevent wrong teacher type
    if (!["Subject Teacher", "Both"].includes(teacher.teacherType)) {
      return res.status(400).json({
        message: "Only Subject or Both teachers can be assigned subjects"
      });
    }

    subjectIds.forEach(subjectId => {
      let subjectEntry = classDoc.subjects.find(
        s => s.subject.toString() === subjectId
      );

      if (!subjectEntry) {
        subjectEntry = { subject: subjectId, teachers: [] };
        classDoc.subjects.push(subjectEntry);
      }

      // ✅ Add teacher to subject
      if (!subjectEntry.teachers.includes(teacherId)) {
        subjectEntry.teachers.push(teacherId);
      }

      // ✅ Track subject on teacher profile
      if (!teacher.subjectSpecialization.includes(subjectId)) {
        teacher.subjectSpecialization.push(subjectId);
      }
    });

    await classDoc.save();
    await teacher.save();

    res.json({ message: "Subject(s) assigned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign subjects" });
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

export const syncAllClassStudents = async (req, res) => {
  try {
    const allClasses = await Class.find();

    if (allClasses.length === 0) {
      return res.status(404).json({ message: "No classes found." });
    }

    let updatedClasses = [];

    for (const classDoc of allClasses) {
      const classId = classDoc._id;

      // Find students whose 'classes' array contains this class
      const students = await Students.find({ classes: classId }).select("_id name");

      const studentIds = students.map(s => s._id);

      // Update the class's 'students' array
      await Class.findByIdAndUpdate(classId, { students: studentIds });

      updatedClasses.push({
        classId,
        className: classDoc.className,
        totalStudents: studentIds.length,
        studentNames: students.map(s => s.name)
      });
    }

    res.json({
      message: "✅ All classes synced successfully.",
      totalClasses: updatedClasses.length,
      details: updatedClasses,
    });

  } catch (error) {
    console.error("❌ Error syncing all class students:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const patchClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ message: "classId is required." });
    }

    // 1. Find all students that belong to this class (via their 'classes' array)
    const studentsInClass = await Students.find({ classes: classId }).select("_id");

    // 2. Extract their IDs
    const studentIds = studentsInClass.map(student => student._id);

    // 3. Update the class document's 'students' array
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { students: studentIds },
      { new: true }
    ).populate("students");

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    res.json({
      message: "✅ Class student list updated successfully.",
      updatedCount: studentIds.length,
      students: updatedClass.students.map(s => ({
        id: s._id,
        name: s.name,
      })),
    });

  } catch (error) {
    console.error("🚨 Error syncing class students:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
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
    console.log(`Fetching total feeding paid for school ID: ${schoolId}`); // ✅ Log the school ID received

    // ✅ Retrieve all classes in this school
    const classes = await Class.find({ school: schoolId });
    console.log(`Total classes found: ${classes.length}`); // ✅ Log number of classes found

    if (classes.length === 0) {
      return res.status(404).json({ message: "No classes found for this school.", totalFeedingPaid: 0 });
    }

    // ✅ Aggregate feeding fees
    const totalFeedingPaid = await Class.aggregate([
      { $match: { school: new mongoose.Types.ObjectId(schoolId) } }, // Ensure proper ObjectId matching
      { $group: { _id: null, total: { $sum: "$totalFeedingPaid" } } }, // Sum feeding fees
    ]);

    console.log(`Aggregated total feeding paid: ${totalFeedingPaid}`); // ✅ Log aggregation result

    res.status(200).json({
      message: "Total feeding paid fetched successfully",
      totalFeedingPaid: totalFeedingPaid.length ? totalFeedingPaid[0].total : 0, // Return total or 0 if no classes found
    });

  } catch (error) {
    console.error("Error fetching total feeding paid:", error);
    res.status(500).json({ message: "Server error fetching total feeding paid" });
  }
};


export const restoreStudentClasses = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ message: "School ID is required." });
  }

  try {
    // Fetch all classes for this school
    const allClasses = await Class.find({ school: schoolId });

    let totalUpdated = 0;
    let notFoundStudents = [];

    for (const cls of allClasses) {
      if (!cls.students || cls.students.length === 0) continue;

      for (const studentId of cls.students) {
        const student = await Students.findById(studentId);

        if (!student) {
          notFoundStudents.push(studentId.toString());
          continue;
        }

        // Make sure classes is an array
        if (!Array.isArray(student.classes)) {
          student.classes = [];
        }

        // Ensure this class ID is in the student's classes array
        if (!student.classes.some(id => id.toString() === cls._id.toString())) {
          student.classes = [cls._id]; // or push if multiple classes are allowed
          await student.save();
          totalUpdated++;
        }
      }
    }

    res.status(200).json({
      message: "Student class assignments restored from Classes collection.",
      totalUpdated,
      notFoundStudents,
    });

  } catch (error) {
    console.error("Error restoring student classes:", error);
    res.status(500).json({
      message: "Failed to restore student classes.",
      error: error.message,
    });
  }
};
