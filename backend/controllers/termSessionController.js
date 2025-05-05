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
      // Step 1: Find and update the TermSession
      const term = await TermSession.findById(termId);
      if (!term) return res.status(404).json({ message: "Term session not found" });
  
      term.classFees = classFees;
      await term.save();
  
      const { schoolId, yearLabel, termName, startDate, endDate } = term;
  
      // Step 2: Get all students in the school
      const students = await Student.find({ schoolId }).populate("classes");
  
      for (let student of students) {
        // Match student's class with the updated classFees
        const matchedClass = student.classes.find(cls =>
          classFees.some(fee => fee.classId === cls._id.toString())
        );
  
        if (!matchedClass) continue;
  
        const feeData = classFees.find(fee => fee.classId === matchedClass._id.toString());
  
        // Step 3: Ensure academic record for the year exists
        let yearRecord = student.academicRecords.find(y => y.yearLabel === yearLabel);
        if (!yearRecord) {
          yearRecord = {
            yearLabel,
            terms: [],
          };
          student.academicRecords.push(yearRecord);
        }
  
        // Step 4: Ensure the term record exists and update fees
        let termRecord = yearRecord.terms.find(t => t.termName === termName);
        if (!termRecord) {
          yearRecord.terms.push({
            termName,
            fees: {
              totalFees: feeData.totalFees || 0,
              amountPaid: 0,
              arrears: 0,
              balance: feeData.totalFees || 0,
              paymentHistory: [],
            },
            attendance: [],
            totalAttendance: 0,
            subjects: [],
            startDate,
            endDate,
          });
        } else {
          termRecord.fees = {
            totalFees: feeData.totalFees || 0,
            amountPaid: 0,
            arrears: 0,
            balance: feeData.totalFees || 0,
            paymentHistory: [],
          };
        }
  
        await student.save();
      }
  
      res.status(200).json({ message: "Term session fees saved and student records updated." });
    } catch (error) {
      console.error("Error saving term session:", error);
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
