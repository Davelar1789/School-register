import Students from "../models/Student.model.js";
import TermSession from "../models/TermSession.model.js";

export const patchNewStudentsAcademicRecords = async (req, res) => {
  try {
    const students = await Students.find({ academicRecords: { $size: 0 } });

    if (!students.length) {
      return res.status(200).json({ message: "No students with empty academic records." });
    }

    for (const student of students) {
      const { schoolId, classes } = student;
      if (!classes || classes.length === 0) continue;

      const termSessions = await TermSession.find({ schoolId });

      if (!termSessions.length) continue;

      const academicRecordsMap = {};

      for (const term of termSessions) {
        const { yearLabel, termName, classFees, startDate, endDate } = term;

        const classFee = classFees.find(
          (fee) => fee.classId.toString() === classes[0].toString()
        );

        if (!classFee) continue;

        if (!academicRecordsMap[yearLabel]) {
          academicRecordsMap[yearLabel] = {
            yearLabel,
            terms: [],
          };
        }

        academicRecordsMap[yearLabel].terms.push({
          termName,
          fees: {
            totalFees: classFee.totalFees,
            amountPaid: 0,
            arrears: 0,
            balance: classFee.totalFees,
            paymentHistory: [],
          },
          startDate,
          endDate,
        });
      }

      const newAcademicRecords = Object.values(academicRecordsMap);
      if (newAcademicRecords.length > 0) {
        student.academicRecords = newAcademicRecords;
        await student.save();
      }
    }

    res.status(200).json({ message: "Academic records patched for new students successfully." });

  } catch (error) {
    console.error("Patch error:", error);
    res.status(500).json({ error: "Something went wrong while patching academic records." });
  }
};
