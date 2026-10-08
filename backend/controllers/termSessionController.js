import mongoose from 'mongoose';
import TermSession from "../models/TermSession.model.js";
import Student from "../models/Student.model.js";
import Class from "../models/Class.model.js";

// Call this after create/update, or via a daily cron job
export const syncActiveTermFlags = async (schoolId) => {
  const now = new Date();

  // Deactivate everything first
  await TermSession.updateMany(
    { schoolId },
    { $set: { isActive: false } }
  );

  // Activate only the term whose range contains "now"
  await TermSession.updateOne(
    { schoolId, startDate: { $lte: now }, endDate: { $gte: now } },
    { $set: { isActive: true } }
  );
};

function findPreviousTerm(student, currentYear, currentTermName) {
  const termOrder = ["Term 1", "Term 2", "Term 3"];
  console.log("🔍 [findPreviousTerm] Looking for previous term...");
  console.log("📘 Current Year:", currentYear, "| Current Term:", currentTermName);

  console.log(
    "📚 Student Academic Years:",
    student.academicRecords.map(y => y.yearLabel)
  );

  const currentYearRecord = student.academicRecords.find(y => y.yearLabel === currentYear);
  if (!currentYearRecord) {
    console.log("⚠️ No record found for current year:", currentYear);
    return null;
  }
  console.log("✅ Found current year record with terms:", currentYearRecord.terms.map(t => t.termName));

  const currentIndex = termOrder.indexOf(currentTermName);
  console.log("🔢 Current Term Index:", currentIndex);

  if (currentIndex === -1) {
    console.log("⚠️ Current term not found in termOrder list");
    return null;
  }

  // 1. Look for previous term in the same year
  if (currentIndex > 0) {
    const prevTermName = termOrder[currentIndex - 1];
    console.log("🔎 Checking previous term in the SAME year:", prevTermName);
    const prevTerm = currentYearRecord.terms.find(t => t.termName === prevTermName);
    if (prevTerm) {
      console.log("✅ Found previous term in same year:", prevTermName);
      prevTerm.year = currentYear;   // ✅ attach year
      return prevTerm;               // ✅ return same object
    } else {
      console.log("❌ No record of", prevTermName, "in", currentYear);
    }
  } else {
    console.log("ℹ️ Current term is the first term of the year → must check previous year");
  }

  // 2. Otherwise, check the previous year's last term
  const allYears = student.academicRecords.map(y => y.yearLabel).sort();
  console.log("📅 All available years (sorted):", allYears);

  const currentYearIndex = allYears.indexOf(currentYear);
  console.log("📌 Current Year Index in sorted list:", currentYearIndex);

  if (currentYearIndex > 0) {
    const prevYear = allYears[currentYearIndex - 1];
    console.log("🔎 Checking previous year:", prevYear);

    const prevYearRecord = student.academicRecords.find(y => y.yearLabel === prevYear);
    if (prevYearRecord) {
      console.log("✅ Found previous year record with terms:", prevYearRecord.terms.map(t => t.termName));

      for (let i = termOrder.length - 1; i >= 0; i--) {
        const prevTermName = termOrder[i];
        console.log("➡️ Looking for term:", prevTermName, "in", prevYear);
        const prevTerm = prevYearRecord.terms.find(t => t.termName === prevTermName);
        if (prevTerm) {
          console.log("🎯 Found previous term:", prevTermName, "in", prevYear);
          prevTerm.year = prevYear;   // ✅ attach year
          return prevTerm;            // ✅ return same object
        }
      }
      console.log("❌ No terms found in previous year:", prevYear);
    } else {
      console.log("⚠️ No academic record found for previous year:", prevYear);
    }
  } else {
    console.log("ℹ️ No earlier academic years exist before", currentYear);
  }

  console.log("❌ No previous term found at all → returning null");
  return null;
}



// Get all academic years for a school
export const getAcademicYears = async (req, res) => {
  const { schoolId } = req.params;
  try {
    const years = await TermSession.find({ schoolId }).distinct("yearLabel");
    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch academic years", error });
  }
};

// Get all terms for a given academic year and school
export const getTermsByYear = async (req, res) => {
  const { schoolId, yearLabel } = req.params;
  try {
    const terms = await TermSession.find({ schoolId, yearLabel });
    res.status(200).json(terms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch terms", error });
  }
};

// Add new academic year (no terms initially, just the label)
export const addAcademicYear = async (req, res) => {
    const { schoolId, yearLabel } = req.body;
  
    try {
      // Convert schoolId to ObjectId
      const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
  
      // Check if the academic year already exists
      const existing = await TermSession.findOne({ schoolId: schoolObjectId, yearLabel });
      if (existing) {
        return res.status(400).json({ message: 'Academic year already exists' });
      }
  
      // Fetch classes associated with the school
      const classes = await Class.find({ school: schoolObjectId });
      if (!classes || classes.length === 0) {
        return res.status(400).json({ message: 'No classes found for this school.' });
      }
  
      // Prepare classFees array
      const classFees = classes.map((cls) => ({
        classId: cls._id,
        className: cls.className,
        totalFees: 0,
      }));
  
      // Define term names
      const termNames = ['Term 1', 'Term 2', 'Term 3'];
  
      // Create term sessions for each term
      const termSessions = termNames.map((termName) => ({
        schoolId: schoolObjectId,
        yearLabel,
        termName,
        startDate: new Date(),
        endDate: new Date(),
        classFees,
        isActive: true,
      }));
  
      // Insert term sessions into the database
      await TermSession.insertMany(termSessions);
  
      // Update students' academic records
      await Student.updateMany(
        { schoolId: schoolObjectId, 'academicRecords.yearLabel': { $ne: yearLabel } },
        {
          $push: {
            academicRecords: {
              yearLabel,
              terms: [],
            },
          },
        }
      );
  
      res.status(201).json({ message: 'Academic year added and students updated' });
    } catch (error) {
      console.error('Error adding academic year:', error);
      res.status(500).json({ message: 'Failed to add academic year', error });
    }
  };
  

  export const createTermSession = async (req, res) => {
    const { schoolId, yearLabel, termName, startDate, endDate, classFees } = req.body;

    try {
      if (!schoolId || !yearLabel || !termName || !startDate || !endDate) {
        return res.status(400).json({ message: "School, year, term name and both dates are required." });
      }
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ message: "The end date can't be before the start date." });
      }

      const term = new TermSession({
        schoolId,
        yearLabel,
        termName,
        startDate,
        endDate,
        classFees,
        isActive: true,
      });
  
      await term.save();
      await syncActiveTermFlags(schoolId);
      res.status(201).json({ message: "Term created successfully", term });
    } catch (error) {
      console.error("Error creating term session:", error);
      res.status(500).json({ message: "Failed to create term", error });
    }
  };
  

// Add or Update a specific term with fees
export const saveTermSession = async (req, res) => {
  const { termId } = req.params;
  const { classFees } = req.body;

  try {
    console.log("🔹 Incoming saveTermSession request:", { termId, classFees });

    // Step 1: Find and update the TermSession
    const term = await TermSession.findById(termId);
    if (!term) {
      console.warn("⚠️ Term session not found:", termId);
      return res.status(404).json({ message: "Term session not found" });
    }

    term.classFees = classFees;
    await term.save();

    const { schoolId, yearLabel, termName, startDate, endDate } = term;
    console.log(`✅ Term session found: ${termName} - ${yearLabel} | Dates: ${startDate} to ${endDate}`);

    // Step 2: Get all students in the school
    const students = await Student.find({ schoolId }).populate("classes");
    console.log(`👩‍🎓 Found ${students.length} students in school ${schoolId}`);

    for (let student of students) {
      console.log(`\n--- Processing student: ${student._id} (${student.name || "Unnamed"}) ---`);

      // Step 2a: Match student's class with the updated classFees
      const matchedClass = student.classes.find(cls =>
        classFees.some(fee => fee.classId === cls._id.toString())
      );
      if (!matchedClass) {
        console.log(`⏭️ Skipping student (no matching class fees): ${student._id}`);
        continue;
      }

      const feeData = classFees.find(fee => fee.classId === matchedClass._id.toString());
      console.log(`🏫 Matched class: ${matchedClass._id}, Total Fees: ${feeData.totalFees}`);

      // Step 3: Ensure academic record for the year exists
      let yearRecord = student.academicRecords.find(y => y.yearLabel === yearLabel);
      if (!yearRecord) {
        console.log(`📘 Creating new year record for: ${yearLabel}`);
        yearRecord = { yearLabel, terms: [] };
        student.academicRecords.push(yearRecord);
      }

      // Step 4: Ensure the term record exists
      let termRecord = yearRecord.terms.find(t => t.termName === termName);

    let arrears = 0;
const previousTerm = findPreviousTerm(student, yearLabel, termName);

if (previousTerm?.fees?.balance > 0) {
  arrears = previousTerm.fees.balance;
  console.log(
    `💰 Carrying arrears from previous term: ${previousTerm.termName} (${previousTerm.year}) → ${arrears}`
  );
} else {
  console.log(
    "ℹ️ No previous term with arrears found → No arrears carried.",
    previousTerm ? `(PrevTerm fees balance = ${previousTerm.fees?.balance || "undefined"})` : "(No term)"
  );
}
      // Step 6: If no term record, create one
      if (!termRecord) {
        console.log(`🆕 Creating new term record: ${termName} - ${yearLabel}`);
        yearRecord.terms.push({
          termName,
          fees: {
            totalFees: feeData.totalFees || 0,
            amountPaid: 0,
            arrears,
            balance: (feeData.totalFees || 0) + arrears,
            paymentHistory: [],
          },
          attendance: [],
          totalAttendance: 0,
          subjects: [],
          startDate,
          endDate,
        });
      } else {
        // Update existing term record without wiping history
        console.log(`✏️ Updating existing term record: ${termName} - ${yearLabel}`);
        const prevPayments = termRecord.fees?.paymentHistory || [];
        const prevAmountPaid = termRecord.fees?.amountPaid || 0;

        termRecord.fees.totalFees = feeData.totalFees || 0;
        termRecord.fees.arrears = arrears;
        termRecord.fees.amountPaid = prevAmountPaid;
        termRecord.fees.balance = (feeData.totalFees || 0) + arrears - prevAmountPaid;
        termRecord.fees.paymentHistory = prevPayments;

        console.log(
          `📊 Updated Fees → Total: ${feeData.totalFees}, Paid: ${prevAmountPaid}, Arrears: ${arrears}, Balance: ${termRecord.fees.balance}`
        );
      }

      await student.save();
      console.log(`✅ Student ${student._id} record saved successfully.`);
    }

    res.status(200).json({
      message: "Term session fees saved and student records updated with arrears & balances.",
    });
  } catch (error) {
    console.error("❌ Error saving term session:", error);
    res.status(500).json({ message: "Failed to save term session", error });
  }
};


// Get fees for a specific term
export const getTermFees = async (req, res) => {
  const { schoolId, yearLabel, termName } = req.params;

  try {
    const term = await TermSession.findOne({ schoolId, yearLabel, termName });
    if (!term) return res.status(404).json({ message: "Term not found" });

    res.status(200).json(term.classFees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch term fees", error });
  }
};

// OPTIONAL: Delete a term session and remove from students
export const deleteTermSession = async (req, res) => {
  const { schoolId, yearLabel, termName } = req.params;

  try {
    await TermSession.findOneAndDelete({ schoolId, yearLabel, termName });

    await Student.updateMany(
      { schoolId },
      {
        $pull: {
          "academicRecords.$[record].terms": { termName },
        },
      },
      {
        arrayFilters: [{ "record.yearLabel": yearLabel }],
      }
    );

    res.status(200).json({ message: "Term session deleted and student records updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete term session", error });
  }
};

// Update start and/or end date for a term
export const updateTermDates = async (req, res) => {
  const { termId } = req.params;
  const { startDate, endDate } = req.body;

  try {
    const term = await TermSession.findById(termId);
    if (!term) {
      return res.status(404).json({ message: "Term session not found" });
    }

    // Only update if provided
    if (startDate) term.startDate = new Date(startDate);
    if (endDate) term.endDate = new Date(endDate);

    if (term.endDate < term.startDate) {
      return res.status(400).json({ message: "The end date can't be before the start date." });
    }

    await term.save();
    await syncActiveTermFlags(term.schoolId);

    res.status(200).json({
      message: "Term dates updated successfully",
      updatedTerm: term,
    });
  } catch (error) {
    console.error("Error updating term dates:", error);
    res.status(500).json({ message: "Failed to update term dates", error });
  }
};

export const getLatestTerm = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized access" });
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const schoolId = decodedToken.schoolId;
    if (!schoolId) return res.status(400).json({ message: "Missing school ID in token" });

    const now = new Date();

    // Try to find the term whose date range contains "now"
    let currentTerm = await TermSession.findOne({
      schoolId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Fallback: if no term currently covers today (gap between terms),
    // pick the most recently started term as the closest "current" one
    if (!currentTerm) {
      currentTerm = await TermSession.findOne({ schoolId })
        .sort({ startDate: -1 })
        .limit(1);
    }

    if (!currentTerm) {
      console.warn("No term found for school:", schoolId);
      return res.status(404).json({ message: "No term found." });
    }

    res.status(200).json(currentTerm);
  } catch (error) {
    console.error("Error fetching latest term:", error);
    res.status(500).json({ message: "Database query failed!", error: error.message });
  }
};

