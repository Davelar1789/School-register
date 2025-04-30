import TermSession from "../models/TermSession.model.js";
import Students from "../models/Student.model.js";
import Class from "../models/Class.model.js";

export const createTermSession = async (req, res) => {
  try {
    const { schoolId, yearLabel, termName, startDate, endDate, classFees } = req.body;

    // Deactivate previous sessions
    await TermSession.updateMany({ schoolId }, { isActive: false });

    // Create new session
    const newSession = await TermSession.create({
      schoolId,
      yearLabel,
      termName,
      startDate,
      endDate,
      classFees,
      isActive: true,
    });

    // Assign fees to all students
    for (const fee of classFees) {
        const students = await Students.find({ classes: { $in: [fee.classId] } });
        console.log(`Assigning fees for class: ${fee.classId}`);
        console.log(`Found ${students.length} students in this class.`);
        
      for (const student of students) {
        if (!student.academicRecords) {
          student.academicRecords = [];
        }

        let yearRecord = student.academicRecords.find(
          (record) => record.yearLabel === yearLabel
        );

        if (!yearRecord) {
          yearRecord = {
            yearLabel,
            terms: [],
          };
          student.academicRecords.push(yearRecord);
        }

        const existingTerm = yearRecord.terms.find(
          (t) => t.termName === termName
        );

        if (!existingTerm) {
          yearRecord.terms.push({
            termName,
            fees: {
              totalFees: fee.totalFees,
              amountPaid: 0,
              balance: fee.totalFees,
              arrears: 0,
              paymentHistory: [],
            },
            attendance: [],
            totalAttendance: 0,
            subjects: [],
            startDate,
            endDate,
          });
        }
        student.markModified("academicRecords");
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
