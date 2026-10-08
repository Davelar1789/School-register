import Subject from "../models/subject.model.js";
import Class from "../models/Class.model.js";

// Create a new subject
export const createSubject = async (req, res) => {
  try {

    const { name, school, classes } = req.body;

    if (!name || !school || !Array.isArray(classes) || classes.length === 0) {
      console.log("⚠️ Missing or invalid fields:", { name, school, classes });
      return res.status(400).json({
        message: "Name, school, and at least one class are required.",
      });
    }

    // Check if a subject with the same name and school already exists
    const existing = await Subject.findOne({ name, school });

    if (existing) {
      // Merge new class IDs into existing subject (avoid duplicates)
      const newClasses = classes.filter(
        (clsId) => !existing.classes.includes(clsId)
      );

      if (newClasses.length === 0) {
        return res
          .status(400)
          .json({ message: "Subject already exists for all selected classes." });
      }

      existing.classes.push(...newClasses);
      await existing.save();

      return res.status(200).json(existing);
    }

    // Create new subject
    const newSubject = new Subject({ name, school, classes });
    await newSubject.save();

    console.log("✅ Created new subject:", newSubject);
    res.status(201).json(newSubject);
  } catch (err) {
    console.error("🔥 Subject creation error:", err);
    res
      .status(500)
      .json({ message: "Server error while creating subject", error: err.message });
  }
};



// Get all subjects for a specific class in a school
export const getSubjectsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { classId } = req.query;

    const query = { school: schoolId };
    if (classId) {
      query.classes = classId; // Now matches if classId exists in the array
    }

    const subjects = await Subject.find(query)
      .populate("classes", "className") // populate the array of classes
      .sort({ name: 1 });

    res.status(200).json(subjects);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching subjects", error: err.message });
  }
};

// Get single subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id).populate("classes", "name");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching subject", error: err.message });
  }
};


// Update a subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, classes } = req.body;

    if (!name || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({
        message: "Name and at least one class are required.",
      });
    }

    const updated = await Subject.findByIdAndUpdate(
      id,
      { name, classes },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating subject", error: err.message });
  }
};


// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting subject", error: err.message });
  }
};

// GET all subjects taught in a class
export const getSubjectsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const subjects = await Subject.find({ classes: classId });
    res.status(200).json(subjects);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

// PUT to update course materials for subject+class+term
export const updateCourseMaterials = async (req, res) => {
  const { subjectId } = req.params;
  const { classId, term, topics } = req.body;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const existing = subject.courseMaterials.find(
      m => m.class.toString() === classId && m.term === term
    );

    if (existing) {
      existing.topics = topics; // update
    } else {
      subject.courseMaterials.push({
        class: classId,
        term,
        topics,
      });
    }

    await subject.save();
    res.status(200).json({ message: "Course materials saved", data: subject.courseMaterials });
  } catch (err) {
    console.error("❌ Error saving course materials:", err);
    res.status(500).json({ error: "Failed to save course materials" });
  }
};

export const syncClassSubjects = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ message: "classId is required." });
    }

    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    // Find all subjects that include this classId
    const subjects = await Subject.find({ classes: classId });

    if (!subjects.length) {
      return res.status(404).json({ message: "No subjects found for this class." });
    }

    // Build subject structure as expected by Class model
    const subjectEntries = subjects.map(subject => ({
      subject: subject._id,
      teachers: [] // leave empty for now, or you can customize
    }));

    // Overwrite the class's subjects array (or merge if needed)
    foundClass.subjects = subjectEntries;

    await foundClass.save();

    res.status(200).json({
      message: `Synced ${subjectEntries.length} subject(s) to the class.`,
      classId,
      subjects: subjectEntries.map(s => s.subject),
    });

  } catch (err) {
    console.error("❌ Error syncing subjects to class:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};