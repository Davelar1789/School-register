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
      // Find or create the year record
      let yearRecord = student.academicRecords?.find(record => record.yearLabel === yearLabel);

      if (!yearRecord) {
        yearRecord = {
          yearLabel,
          terms: [],
        };
        student.academicRecords.push(yearRecord);
      }

      // Find or create the term record
      let termRecord = yearRecord.terms.find(term => term.termName === termName);

      if (!termRecord) {
        termRecord = {
          termName,
          fees: {
            totalFees,
            amountPaid: 0,
            balance: totalFees,
            arrears: 0,
            paymentHistory: [],
          },
        };
        yearRecord.terms.push(termRecord);
      } else {
        // If term already exists, update fees
        termRecord.fees.totalFees = totalFees;
        termRecord.fees.balance = totalFees - (termRecord.fees.amountPaid || 0);
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
  const { studentId, yearLabel, termName, amount, method, note } = req.body;

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
      method, // optional
      note,   // optional
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
