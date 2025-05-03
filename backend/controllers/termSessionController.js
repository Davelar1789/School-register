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
    console.log('Adding academic year...');
    const { schoolId, yearLabel } = req.body;
    console.log(`Request body: schoolId=${schoolId}, yearLabel=${yearLabel}`);
  
    try {
      // Convert schoolId to ObjectId
      const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
      console.log(`Converted schoolId to ObjectId: ${schoolObjectId}`);
  
      // Check if the academic year already exists
      console.log('Checking for existing academic year...');
      const existing = await TermSession.findOne({ schoolId: schoolObjectId, yearLabel });
      if (existing) {
        console.log('Academic year already exists');
        return res.status(400).json({ message: 'Academic year already exists' });
      }
  
      // Fetch classes associated with the school
      console.log('Fetching classes for school...');
      const classes = await Class.find({ school: schoolObjectId });
      console.log(`Found ${classes.length} classes`);
      if (!classes || classes.length === 0) {
        console.log('No classes found for this school');
        return res.status(400).json({ message: 'No classes found for this school.' });
      }
  
      // Prepare classFees array
      const classFees = classes.map((cls) => ({
        classId: cls._id,
        className: cls.className,
        totalFees: 0,
      }));
      console.log('Prepared classFees array');
  
      // Define term names
      const termNames = ['Term 1', 'Term 2', 'Term 3'];
      console.log('Term names:', termNames);
  
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
      console.log('Created term sessions');
  
      // Insert term sessions into the database
      console.log('Inserting term sessions into database...');
      await TermSession.insertMany(termSessions);
      console.log('Term sessions inserted successfully');
  
      // Update students' academic records
      console.log('Updating students\' academic records...');
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
      console.log('Students\' academic records updated');
  
      res.status(201).json({ message: 'Academic year added and students updated' });
    } catch (error) {
      console.error('Error adding academic year:', error);
      res.status(500).json({ message: 'Failed to add academic year', error });
    }
  };
  

// Add or Update a specific term with fees
export const upsertTermSession = async (req, res) => {
  const { schoolId, yearLabel, termName, startDate, endDate, classFees } = req.body;

  try {
    let term = await TermSession.findOne({ schoolId, yearLabel, termName });

    if (term) {
      // Update existing
      term.startDate = startDate;
      term.endDate = endDate;
      term.classFees = classFees;
      await term.save();
      res.status(200).json({ message: "Term session updated", term });
    } else {
      // Create new
      const newTerm = new TermSession({
        schoolId,
        yearLabel,
        termName,
        startDate,
        endDate,
        classFees,
      });
      await newTerm.save();

      res.status(201).json({ message: "Term session created", term: newTerm });
    }
  } catch (error) {
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
