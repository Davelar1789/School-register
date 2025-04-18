// controllers/classController.js
import Class from "../models/Class.model.js";

// Create a new class
export const createClass = async (req, res) => {
  try {
    const { school, className, description, level, subjects, classTeacher } = req.body;

    // Optional: prevent duplicates within a school
    const existing = await Class.findOne({ school, className });
    if (existing) {
      return res.status(400).json({ message: "Class with this name already exists for this school" });
    }

    const newClass = new Class({
      school,
      className,
      description,
      level,
      subjects,
      classTeacher
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all classes for a school
export const getClassesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const classes = await Class.find({ school: schoolId }).select("_id className");
    res.status(200).json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Server error" });
  }
};
