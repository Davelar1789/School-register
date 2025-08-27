import mongoose from 'mongoose';
import TermSession from "../models/TermSession.model.js";
import Student from "../models/Student.model.js";
import Class from "../models/Class.model.js";

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

      // Step 5: Compute arrears (carry over from previous term/year)
      let arrears = 0;

      // Find the most recent term BEFORE this one
      let allYears = student.academicRecords.sort((a, b) => parseInt(a.yearLabel) - parseInt(b.yearLabel));

      // Flatten all terms with year info
      let allTerms = [];
      for (let y of allYears) {
        for (let t of y.terms) {
          allTerms.push({ year: y.yearLabel, ...t });
        }
      }

      // Order terms by year & startDate
      allTerms.sort((a, b) => {
        if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
        return new Date(a.startDate) - new Date(b.startDate);
      });

      // Find index of current term
      const currentIndex = allTerms.findIndex(
        t => t.year === yearLabel && t.termName === termName
      );

      if (currentIndex > 0) {
        const previousTerm = allTerms[currentIndex - 1];
        if (previousTerm.fees) {
          arrears = previousTerm.fees.balance;
          console.log(
            `💰 Carrying arrears from previous term: ${previousTerm.termName} (${previousTerm.year}) → ${arrears}`
          );
        }
      } else {
        console.log("ℹ️ No previous term found → No arrears carried.");
      }

      // Step 6: If no record, create one
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
        console.log(`✏️ Updating existing term record: ${termName} - ${yearLabel}`);
        const prevPayments = termRecord.fees?.paymentHistory || [];
        const prevAmountPaid = termRecord.fees?.amountPaid || 0;

        termRecord.fees.totalFees = feeData.totalFees || 0;
        termRecord.fees.arrears = arrears;
        termRecord.fees.amountPaid = prevAmountPaid;
        termRecord.fees.balance =
          (feeData.totalFees || 0) + arrears - prevAmountPaid;
        termRecord.fees.paymentHistory = prevPayments;

        console.log(`📊 Updated Fees → Total: ${feeData.totalFees}, Paid: ${prevAmountPaid}, Arrears: ${arrears}, Balance: ${termRecord.fees.balance}`);
      }

      await student.save();
      console.log(`✅ Student ${student._id} record saved successfully.`);
    }

    res
      .status(200)
      .json({ message: "Term session fees saved and student records updated with arrears & balances." });
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

    await term.save();

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
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    const schoolId = decodedToken.schoolId;


    if (!schoolId) return res.status(400).json({ message: "Missing school ID in token" });

    const latestTerm = await TermSession.findOne({ schoolId })
      .sort({ startDate: -1 })
      .limit(1);

    if (!latestTerm) {
      console.warn("No active term found for school:", schoolId);
      return res.status(404).json({ message: "No active term found." });
    }

    res.status(200).json(latestTerm);
  } catch (error) {
    console.error("Error fetching latest term:", error);
    res.status(500).json({ message: "Database query failed!", error: error.message });
  }
};

