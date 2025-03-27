import express from "express";
import { deleteEnrolledCourse } from "../controllers/general/enroll.controller.js";

const router = express.Router();

// Route to unenroll in a course
router.delete("/users/:userId/unenroll/:courseId", deleteEnrolledCourse);


  

export default router;
