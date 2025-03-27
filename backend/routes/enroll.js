import express from "express";
import { enrollInCourse, getEnrolledCourses, deleteEnrolledCourse } from "../controllers/general/enroll.controller.js";

const router = express.Router();

// Route to enroll in a course
router.post("/enroll", enrollInCourse);
router.delete("/unenroll", deleteEnrolledCourse);



// Route to get all enrolled courses for a user
router.get("/:userId/enrolled-courses", getEnrolledCourses);

router.get("/:courseId", async (req, res) => {
    const { courseId } = req.params;
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course details", error });
    }
  });
  

export default router;
