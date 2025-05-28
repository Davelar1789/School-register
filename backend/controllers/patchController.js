import Students from "../models/Student.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from "../models/Class.model.js";


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

export const patchOldClassesToNewFormat = async (req, res) => {
  try {
    const allClasses = await Class.find({});

    let updatedCount = 0;

    const getNewValues = (oldName) => {
      const lower = oldName.toLowerCase();

      if (lower === "creche") return { level: "Creche", number: undefined, className: "Creche" };
      if (lower.startsWith("nursery")) {
        const num = parseInt(lower.split(" ")[1]);
        return { level: "Nursery", number: num, className: `Nursery ${num}` };
      }
      if (lower.startsWith("kg")) {
        const num = parseInt(lower.split(" ")[1]);
        return { level: "Kindergaten", number: num, className: `KG ${num}` };
      }
      if (lower.startsWith("basic")) {
        const num = parseInt(lower.split(" ")[1]);
        if (num >= 1 && num <= 6) {
          return { level: "Primary", number: num, className: `Basic ${num}` };
        } else if (num === 7) {
          return { level: "Junior High", number: 1, className: `JHS 1` };
        } else if (num === 8) {
          return { level: "Junior High", number: 2, className: `JHS 2` };
        } else if (num === 9) {
          return { level: "Junior High", number: 3, className: `JHS 3` };
        }
      }

      return null;
    };

    for (const oldClass of allClasses) {
      const newValues = getNewValues(oldClass.className);

      if (newValues) {
        oldClass.level = newValues.level;
        oldClass.number = newValues.number;
        oldClass.className = newValues.className;

        await oldClass.save();
        updatedCount++;
      }
    }

    res.status(200).json({ message: `Updated ${updatedCount} classes successfully.` });
  } catch (err) {
    console.error("Error updating old classes:", err);
    res.status(500).json({ message: "Failed to patch old classes", error: err.message });
  }
};