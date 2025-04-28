import TermSession from "../models/TermSession.model.js";
import Students from "../models/Student.model.js";
import Class from "../models/Class.model.js";

export const createTermSession = async (req, res) => {
  try {
    const { schoolId, yearLabel, termName, startDate, endDate, classFees } = req.body;

    // Deactivate previous sessions
    await TermSession.updateMany({ schoolId }, { isActive: false });

    const newSession = await TermSession.create({
      schoolId,
      yearLabel,
      termName,
      startDate,
      endDate,
      classFees,
      isActive: true,
    });

    // Now assign fees to all students
    for (const fee of classFees) {
      const students = await Students.find({ classes: fee.classId });

      for (const student of students) {
        student.fees.push({
          term: termName,
          year: yearLabel,
          totalFees: fee.totalFees,
          amount: 0,
          arrears: student.fees.length > 0 ? (student.fees.slice(-1)[0].amount > 0 ? student.fees.slice(-1)[0].amount : 0) : 0,
          paid: false,
        });
        await student.save();
      }
    }

    res.status(201).json(newSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create term session." });
  }
};

export const getCurrentTermSession = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const session = await TermSession.findOne({ schoolId, isActive: true });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch current term session." });
  }
};

export const getAllTermSessions = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const sessions = await TermSession.find({ schoolId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch term sessions." });
  }
};
