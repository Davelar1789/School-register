import express from 'express';
import Course from '../models/Course.model.js';
import User from "../models/User.model.js";

const router = express.Router();

router.get('/summary', async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      res.status(200).json({ totalUsers, totalCourses });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching summary data', error });
    }
  });

  router.get('/users', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await User.find({})
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const totalUsers = await User.countDocuments();
      res.status(200).json({ users, totalUsers });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  });

  router.put('/users/:id', async (req, res) => {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
      res.status(200).json({ message: 'User role updated', user });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error });
    }
  });
  
  
export default router;
