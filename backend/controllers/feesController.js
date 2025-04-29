// controllers/feesController.js
import Students from "../models/Student.model.js";
import Classes from "../models/Class.model.js";

// Admin sets fees for all students in a class for a specific term
export const setClassFees = async (req, res) => {
  const { classId, yearLabel, termName, totalFees } = req.body;

  if (!classId || !yearLabel || !termName || !totalFees) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Fetch students in the selected class
    const students = await Students.find({ classes: classId });

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found in this class." });
    }

    for (const student of students) {
      if (!student.academicRecords || student.academicRecords.length === 0) {
        student.academicRecords = [];
      }
    
      const existingYearRecord = student.academicRecords.find(record => record.yearLabel === yearLabel);
    
      if (!existingYearRecord) {
        // No record for this year yet, create it
        student.academicRecords.push({
          yearLabel,
          terms: [
            {
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
              startDate: startDate,
              endDate: endDate,
            },
          ],
        });
      } else {
        // Year record exists, push a new term
        existingYearRecord.terms.push({
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
          startDate: startDate,
          endDate: endDate,
        });
      }
    
      await student.save();
    }
    

    res.status(200).json({ message: "Fees set successfully for the class." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Student makes a payment
export const makePayment = async (req, res) => {
  const { studentId, yearLabel, termName, amount } = req.body;

  if (!studentId || !yearLabel || !termName || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const student = await Students.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const yearRecord = student.academicRecords.find(record => record.yearLabel === yearLabel);
    if (!yearRecord) {
      return res.status(404).json({ message: "Year not found for student." });
    }

    const termRecord = yearRecord.terms.find(term => term.termName === termName);
    if (!termRecord) {
      return res.status(404).json({ message: "Term not found for student." });
    }

    if (!termRecord.fees) {
      return res.status(400).json({ message: "Fees record missing for this term." });
    }

    // Update payment
    termRecord.fees.amountPaid += amount;
    termRecord.fees.balance = termRecord.fees.totalFees - termRecord.fees.amountPaid;
    termRecord.fees.paymentHistory.push({
      date: new Date(),
      amount,
    });

    // Handle arrears if any
    if (termRecord.fees.balance < 0) {
      termRecord.fees.arrears = Math.abs(termRecord.fees.balance);
      termRecord.fees.balance = 0;
    }

    await student.save();
    res.status(200).json({ message: "Payment recorded successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const migrateOldStudents = async (req, res) => {
  try {
    const students = await Students.find({});

    for (const student of students) {
      if (!student.academicRecords || student.academicRecords.length === 0) {
        const yearRecord = {
          yearLabel: "2024/2025", // Default year
          terms: [
            {
              termName: "Term 1",
              fees: {
                totalFees: student.fees?.[0]?.totalFees || 0,
                amountPaid: student.fees?.[0]?.amount || 0,
                balance: (student.fees?.[0]?.totalFees || 0) - (student.fees?.[0]?.amount || 0),
                arrears: student.fees?.[0]?.arrears || 0,
                paymentHistory: [],
              },
              attendance: student.attendance || [],
              totalAttendance: student.totalAttendance || 0,
              subjects: student.subjects || [],
              startDate: student.termBeginDate,
              endDate: student.termEndDate,
            },
          ],
        };

        student.academicRecords = [yearRecord];

        // Clean up old fields if you want
        student.attendance = undefined;
        student.totalAttendance = undefined;
        student.subjects = undefined;
        student.fees = undefined;
        student.year = undefined;
        student.termBeginDate = undefined;
        student.termEndDate = undefined;

        await student.save();
      }
    }

    res.status(200).json({ message: "Migration completed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Migration failed." });
  }
};
