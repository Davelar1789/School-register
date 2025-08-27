// controllers/feesController.js
import Students from "../models/Student.model.js";
import Classes from "../models/Class.model.js";
import TermSession from "../models/TermSession.model.js";

// ✅ Admin Sets Feeding Fee Per Class
export const setFeedingFee = async (req, res) => {
  const { feedingFees } = req.body; // ✅ Expecting an object with classId: fee

  if (!feedingFees || typeof feedingFees !== "object") {
    return res.status(400).json({ message: "Invalid data format." });
  }

  try {
    // ✅ Update feeding fees for all classes in one request
    const updatePromises = Object.entries(feedingFees).map(async ([classId, fee]) => {
      await Classes.findByIdAndUpdate(classId, { feedingFee: fee });
      await Students.updateMany({ classes: classId }, { feedingFee: fee });
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Feeding fees updated successfully for all classes." });
  } catch (error) {
    console.error("Error updating feeding fees:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Admin sets fees for all students in a class for a specific term
export const setClassFees = async (req, res) => {
  const { classId, yearLabel, termName, totalFees, schoolId } = req.body;

  console.log("📥 Incoming request body:", req.body);

  if (!classId || !yearLabel || !termName || !totalFees || !schoolId) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // 1. Find the current term session
    const currentTerm = await TermSession.findOne({
      schoolId,
      yearLabel,
      termName,
    }).lean();

    console.log("📌 Current term found:", currentTerm);

    if (!currentTerm) {
      console.warn("❌ Current term session not found.");
      return res.status(404).json({ message: "Current term session not found." });
    }

    // 2. Find the most recent ended term (by date) before this current term starts
    const lastTerm = await TermSession.findOne({
      schoolId,
      endDate: { $lt: currentTerm.startDate },
    })
      .sort({ endDate: -1 }) // latest ended
      .lean();

    console.log("📌 Last term found:", lastTerm);

    // 3. Get students in this class
    const students = await Students.find({ classes: classId });
    console.log(`👨‍🎓 Found ${students.length} students in class ${classId}`);

    if (students.length === 0) {
      console.warn("⚠️ No students found in this class.");
      return res.status(404).json({ message: "No students found in this class." });
    }

    for (const student of students) {
      console.log("➡️ Processing student:", student.fullName || student._id);

      let arrears = 0;
      let prevTermRecord = null;

      if (lastTerm) {
        console.log("🔎 Checking arrears from last term...");

        for (const year of student.academicRecords || []) {
          console.log("   📅 Year record:", year.yearLabel);

          for (const term of year.terms || []) {
            console.log(
              "   🔎 Term checked:",
              term.termName,
              "| EndDate:",
              term.endDate
            );

            if (term.endDate && new Date(term.endDate) <= new Date(lastTerm.endDate)) {
              if (
                !prevTermRecord ||
                new Date(term.endDate) > new Date(prevTermRecord.endDate)
              ) {
                prevTermRecord = term; // latest term before current
                console.log("   ✅ Potential prevTermRecord updated:", prevTermRecord);
              }
            }
          }
        }

        if (prevTermRecord?.fees?.balance > 0) {
          arrears = prevTermRecord.fees.balance;
          console.log("💰 Arrears carried forward:", arrears);
        } else {
          console.log("ℹ️ No arrears found for student.");
        }
      }

      // --- Ensure year record exists
      let yearRecord = student.academicRecords?.find(r => r.yearLabel === yearLabel);
      if (!yearRecord) {
        console.log("📂 Creating new year record:", yearLabel);
        yearRecord = { yearLabel, terms: [] };
        student.academicRecords.push(yearRecord);
      }

      // --- Ensure term record exists
      let termRecord = yearRecord.terms.find(t => t.termName === termName);

      if (!termRecord) {
        console.log("🆕 Creating new term record:", termName);
        termRecord = {
          termName,
          startDate: currentTerm.startDate,
          endDate: currentTerm.endDate,
          fees: {
            totalFees,
            amountPaid: 0,
            arrears,
            balance: totalFees + arrears,
            paymentHistory: [],
          },
        };
        yearRecord.terms.push(termRecord);
      } else {
        console.log("✏️ Updating existing term record:", termName);
        termRecord.startDate = currentTerm.startDate;
        termRecord.endDate = currentTerm.endDate;
        termRecord.fees.totalFees = totalFees;
        termRecord.fees.arrears = arrears;
        termRecord.fees.balance =
          totalFees + arrears - (termRecord.fees.amountPaid || 0);
      }

      await student.save();
      console.log("✅ Fees set for student:", student.fullName || student._id);
    }

    console.log("🎉 All students updated successfully.");
    res.status(200).json({ message: "Fees + arrears set successfully for the class." });
  } catch (error) {
    console.error("❌ Error in setClassFees:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};


// Student makes a payment
export const makePayment = async (req, res) => {
  const { studentId, yearLabel, termName, amount, method, note, date } = req.body;

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
      date: date ? new Date(date) : new Date(),
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

export const fetchFees = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Students.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.status(200).json({ academicRecords: student.academicRecords });
  } catch (error) {
    console.error("Fetch fees error:", error);
    res.status(500).json({ message: 'Server error while fetching fees.' });
  }
};

export const fetchTotalFeesPaid = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;

    // Get all students in this school
    const students = await Students.find({ schoolId });

    let totalFeesPaid = 0;

    // Loop through each student's academic records
    students.forEach(student => {
      student.academicRecords.forEach(year => {
        year.terms.forEach(term => {
          if (term.fees && term.fees.amountPaid) {
            totalFeesPaid += term.fees.amountPaid;
          }
        });
      });
    });

    res.status(200).json({ totalFeesPaid });
  } catch (error) {
    console.error("Error calculating total fees paid:", error);
    res.status(500).json({ message: 'Server error while calculating fees.' });
  }
};


export const getRecentPayments = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Students.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const academicRecords = student.academicRecords || [];

    let latestTerm = null;
    let latestDate = null;

    academicRecords.forEach((record) => {
      (record.terms || []).forEach((term) => {
        if (!latestDate || new Date(term.startDate) > new Date(latestDate)) {
          latestDate = term.startDate;
          latestTerm = term;
        }
      });
    });

    if (!latestTerm || !latestTerm.fees || !latestTerm.fees.paymentHistory) {
      return res.status(404).json({ message: 'No payment history found for latest term' });
    }

    const sortedPayments = [...latestTerm.fees.paymentHistory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.status(200).json({ payments: sortedPayments });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    res.status(500).json({ message: 'Server error while fetching recent payments' });
  }
};