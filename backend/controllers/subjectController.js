import Subject from "../models/subject.model.js";

// Create a new subject
export const createSubject = async (req, res) => {
  try {
    console.log("📩 Incoming Subject Request:", req.body);

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

      console.log("✅ Updated existing subject with new classes:", newClasses);
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
    if (classId) query.class = classId;

    const subjects = await Subject.find(query)
      .populate("class", "name")
      .sort({ name: 1 });

    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subjects", error: err.message });
  }
};

// Get single subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).populate("class", "name");
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subject", error: err.message });
  }
};

// Update a subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class: classId } = req.body;

    const updated = await Subject.findByIdAndUpdate(
      id,
      { name, class: classId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating subject", error: err.message });
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
    res.status(500).json({ message: "Error deleting subject", error: err.message });
  }
};
