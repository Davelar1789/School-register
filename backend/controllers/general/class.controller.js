// controllers/classController.js
import Class from '../../models/Class.model.js';
import crypto from 'crypto';

export const createClass = async (req, res, next) => {
  try {
    const { className } = req.body;
    const instructorId = req.userId; // Assumes auth middleware attaches userId to request

    if (!className) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    // Generate a unique 6-digit code
    const classCode = crypto.randomInt(100000, 999999).toString();

    // Create the class
    const newClass = await Class.create({
      classCode,
      className,
      instructor: instructorId,
    });

    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    next(error);
  }
};

// Join a class by code
export const joinClass = async (req, res) => {
    try {
      const { classCode } = req.body;
      const userId = req.userId; // Assumes userId is extracted from token
  
      const classToJoin = await Class.findOne({ classCode });
      if (!classToJoin) {
        return res.status(404).json({ message: "Class not found with this code" });
      }
  
      if (classToJoin.enrolledStudents.includes(userId)) {
        return res.status(400).json({ message: "You are already enrolled in this class" });
      }
  
      if (classToJoin.enrolledStudents.length >= 70) {
        return res.status(400).json({ message: "Class is full" });
      }
  
      classToJoin.enrolledStudents.push(userId);
      await classToJoin.save();
  
      res.status(200).json({ message: "Successfully joined the class", class: classToJoin });
    } catch (error) {
      console.error("Error joining class:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Get all classes for a student
export const getStudentClasses = async (req, res) => {
    try {
      const userId = req.userId; // Extracted from token
  
      const classes = await Class.find({ enrolledStudents: userId });
  
      res.status(200).json({ classes });
    } catch (error) {
      console.error("Error fetching student classes:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
