import Subject from "../models/Subject.model.js";

// Create a new subject
export const createSubject = async (req, res) => {
  try {
    const { name, school } = req.body;

    if (!name || !school) {
      return res.status(400).json({ message: "Name and school are required." });
    }

    const existing = await Subject.findOne({ name, school });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists for this school." });
    }

    const newSubject = new Subject({ name, school });
    await newSubject.save();

    res.status(201).json(newSubject);
  } catch (err) {
    console.error("Create Subject Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all subjects for a school
export const getSubjectsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const subjects = await Subject.find({ school: schoolId }).sort({ name: 1 });
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subjects", error: err.message });
  }
};

// Get single subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
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
    const { name } = req.body;

    const updated = await Subject.findByIdAndUpdate(id, { name }, { new: true });
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
