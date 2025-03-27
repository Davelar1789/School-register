// routes/classRoutes.js
import express from 'express';
import { createClass, joinClass, getStudentClasses } from '../controllers/general/class.controller.js';
import { authToken } from '../middleware/authToken.js';
import Class from '../models/Class.model.js'; // Update the path if necessary


const router = express.Router();

// POST /api/classes/create - Create a new class
router.post('/create', authToken, createClass);
router.post("/join", authToken, joinClass);
router.get("/student", authToken, getStudentClasses);



// routes/classRoutes.js
router.get('/', authToken, async (req, res) => {
    try {
      const instructorId = req.userId; // Retrieved from auth middleware
      if (!instructorId) {
        return res.status(401).json({ message: "Unauthorized request" });
      }  
      const classes = await Class.find({ instructor: instructorId }).populate('enrolledStudents', 'name email');
      res.status(200).json({ classes });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  

// routes/classRoutes.js
router.delete('/:id', authToken, async (req, res) => {
    try {
      const { id } = req.params;
      await Class.findByIdAndDelete(id);
      res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete class' });
    }
  });

// routes/classRoutes.js
router.put('/:id', authToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { className } = req.body;
      const updatedClass = await Class.findByIdAndUpdate(
        id,
        { className },
        { new: true }
      );
      res.status(200).json({ message: 'Class updated successfully', class: updatedClass });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update class' });
    }
  });
  

export default router;
