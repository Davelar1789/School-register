import TermSession from "../models/TermSession.model.js";
import Student from "../models/Student.model.js";

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
    // Prevent duplicate
    const existing = await TermSession.findOne({ schoolId, yearLabel });
    if (existing) return res.status(400).json({ message: "Academic year already exists" });

    // This is just a placeholder term, you can skip creating a term here if desired
    const placeholder = new TermSession({
      schoolId,
      yearLabel,
      termName: "Placeholder",
      startDate: new Date(),
      endDate: new Date(),
      classFees: [],
      isActive: false,
    });
    await placeholder.save();

    // Update students
    await Student.updateMany(
      { schoolId, "academicRecords.yearLabel": { $ne: yearLabel } },
      {
        $push: {
          academicRecords: {
            yearLabel,
            terms: [],
          },
        },
      }
    );

    res.status(201).json({ message: "Academic year added and students updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add academic year", error });
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
