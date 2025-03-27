import Students from "../../../models/Student.model.js";
import { errorHandler } from "../../../utils/error.js";

export const getAllStudents = async (req, res, next) => {
  try {
    const allStudents = await Students.find().sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ data: allStudents, message: "All Students fetched" });
  } catch (error) {
    next(error);
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Students.distinct("class");
    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching classes", error });
  }
};

export const getStudentDetails = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const studentDetails = await Students.findById(studentId);

    if (!studentDetails) {
      return errorHandler(400, "Student Deleted");
    }

    return res
      .status(200)
      .json({ data: studentDetails, message: "Student Details fetched" });
  } catch (error) {
    next(error);
  }
};

export const getStudentsByClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    const students = await Students.find({ class: className }).sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ data: students, message: `Students in ${className} fetched` });
  } catch (error) {
    next(error);
  }
};

// Function to calculate and save positions
const calculateAndSavePositions = async (className) => {
  const students = await Students.find({ class: className });

  const subjectPositions = {};

  students.forEach((student) => {
    student.subjects.forEach((subject) => {
      if (!subjectPositions[subject.name]) {
        subjectPositions[subject.name] = [];
      }
      subjectPositions[subject.name].push({
        studentId: student._id,
        totalScore: subject.totalScore,
      });
    });
  });

  for (const subjectName in subjectPositions) {
    const sortedScores = subjectPositions[subjectName]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((student, index) => ({
        ...student,
        position: index + 1,
      }));

    for (const student of sortedScores) {
      await Students.updateOne(
        { _id: student.studentId, "subjects.name": subjectName },
        { $set: { "subjects.$.position": student.position } }
      );
    }
  }
};

export const saveStudentGrades = async (req, res) => {
  const { studentId, subjects } = req.body;

  try {
    const student = await Students.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.subjects = subjects;
    await student.save();

    await calculateAndSavePositions(student.class); // Calculate and save positions

    res.status(200).json({ message: "Grades saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving grades", error });
  }
};

export const addSubjectToClass = async (req, res) => {
  const { className, subjectName } = req.body;

  try {
    const students = await Students.find({ class: className });
    for (let student of students) {
      student.subjects.push({
        name: subjectName,
        assessments: [0, 0, 0, 0],
        exam: 0,
        classScore: 0,
        examScore: 0,
        totalScore: 0,
        position: 0,
      });
      await student.save();
    }

    await calculateAndSavePositions(className); // Calculate and save positions

    res.status(200).json({ message: "Subject added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding subject", error });
  }
};

export const saveFees = async (req, res) => {
  const { students } = req.body;

  try {
    for (let student of students) {
      await Students.findByIdAndUpdate(student._id, {
        $set: { fees: student.fees }
      });
    }

    res.status(200).json({ message: "Fees saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving fees", error });
  }
};

export const getFeesData = async (req, res) => {
  const { term } = req.query;

  try {
    const students = await Students.find({}, 'name class fees');
    const processedStudents = students.map(student => {
      const termFees = student.fees.find(fee => fee.term === term) || { amount: 0, arrears: 0, totalFees: 0 };
      return {
        _id: student._id,
        name: student.name,
        class: student.class,
        arrears: termFees.arrears,
        totalFees: termFees.totalFees
      };
    });

    const currentFees = processedStudents[0]?.fees?.find(fee => fee.term === term)?.amount || 0;

    res.status(200).json({ students: processedStudents, currentFees });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fees data", error });
  }
};

// controllers/general/students/students.controller.js

export const saveAttendance = async (req, res) => {
  const { class: className, attendance } = req.body;

  try {
    for (const studentId in attendance) {
      const totalAttendance = attendance[studentId].flat().filter(day => day).length;
      await Students.updateOne(
        { _id: studentId },
        {
          $set: {
            attendance: attendance[studentId].map((week, index) => ({ week: index + 1, days: week })),
            totalAttendance: totalAttendance // Save total attendance
          }
        }
      );
    }
    res.status(200).json({ message: "Attendance saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving attendance", error });
  }
};

export const saveTermDetails = async (req, res) => {
  const { year, termBeginDate, termEndDate } = req.body;

  try {
    // Update all students with the new term details
    await Students.updateMany({}, { $set: { year, termBeginDate, termEndDate } });
    res.status(200).json({ message: "Term details saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving term details", error });
  }
};

export const getTermDetails = async (req, res) => {
  try {
    const student = await Students.findOne();
    if (!student) {
      return res.status(404).json({ message: "No students found" });
    }

    const { year, termBeginDate, termEndDate } = student;

    res.status(200).json({ year, termBeginDate, termEndDate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching term details", error });
  }
};