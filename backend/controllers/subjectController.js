import Subject from "../models/subject.model.js";

// Create a new subject
export const createSubject = async (req, res) => {
  try {
    console.log("📩 Create Subject Request Body:", req.body);

    const { name, school, class: classId, classes } = req.body;

    // Prefer `classes` if present (array), fallback to `class`
    const classIds = Array.isArray(classes)
      ? classes
      : classId
      ? [classId]
      : [];

    if (!name || !school || !classIds.length) {
      console.log("⚠️ Missing required fields:", {
        name,
        school,
        classId,
        classes,
      });
      return res.status(400).json({
        message: "Name, school, and at least one class are required.",
      });
    }

    const createdSubjects = [];

    for (let id of classIds) {
      console.log(`🔍 Checking subject existence for class: ${id}`);
      const existing = await Subject.findOne({ name, school, class: id });

      if (existing) {
        console.log(`❌ Subject '${name}' already exists for class ${id}`);
        continue;
      }

      const newSubject = new Subject({ name, school, class: id });
      await newSubject.save();
      console.log(`✅ Created subject '${name}' for class ${id}`);
      createdSubjects.push(newSubject);
    }

    if (createdSubjects.length === 0) {
      return res.status(400).json({
        message: "Subject already exists for all selected classes.",
      });
    }

    res.status(201).json(createdSubjects);
  } catch (err) {
    console.error("🔥 Create Subject Error:", err);
    res.status(500).json({
      message: "Server error while creating subject",
      error: err.message,
    });
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
