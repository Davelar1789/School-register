// controllers/classController.js
import Class from "../models/Class.model.js";
import Students from "../models/Student.model.js"; // ✅ Add this
import Teacher from "../models/Teacher.model.js"; // ✅ Also recommended

// Create a new class
export const createClass = async (req, res) => {
    try {
      const { school, className, description, level, teachers = [], students = [] } = req.body;
  
      if (!school || !className || !level) {
        return res.status(400).json({ message: "school, className, and level are required" });
      }
  
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
        teachers,
        students,
      });
  
      await newClass.save();
      res.status(201).json(newClass);
    } catch (err) {
      console.error("Error creating class:", err.stack);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

// Get all classes for a school
export const getClassesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const classes = await Class.find({ school: schoolId })
    .populate({ path: "teachers", select: "name" })
    .populate({ path: "students", model: "students", select: "name" });
  

    res.status(200).json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

