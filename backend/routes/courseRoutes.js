import express from 'express';
const router = express.Router();

// Import specific functions from course controller
import {
  addCourse,
  getCourses,
  getCourseById,
  getCourseById2,
  addMaterialToCourse,
  addTestToCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/general/course.controller.js';

// Route to add a new course
router.post('/courses', addCourse);

// Route to get all courses
router.get('/courses', getCourses);

// Route to get a specific course by ID (basic details only)
router.get('/courses/:id', getCourseById);

// Route to get a specific course by ID with materials and tests
router.get('/courses/:id/full', getCourseById2);

// Route to add materials to a specific course
router.post('/courses/:id/materials', addMaterialToCourse);

// Route to add a test to a specific course
router.post('/courses/:id/tests', addTestToCourse);

// Route to update a course by ID
router.put('/courses/:id', updateCourse);

// Route to delete a course by ID
router.delete('/courses/:id', deleteCourse);

export default router;
