import User from "../../models/User.model.js";
import Course from "../../models/Course.model.js"; // Assuming a Course model exists
import mongoose from "mongoose";

export const enrollInCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid userId or courseId" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is already enrolled in the course
    if (user.enrolledCourses.some((c) => c.courseId.toString() === courseId)) {
      return res.status(400).json({ message: "User is already enrolled in this course" });
    }

    // Add the course to the user's enrolled courses
    user.enrolledCourses.push({
      courseId,
      title: course.title,
      courseCode: course.courseCode,
      description: course.description,
    });

    // Decrement XP by 50
    user.stats = {
      ...user.stats, // Preserve other stats if any
      xp: (user.stats?.xp || 0) - 50, // Add 50 XP or set to 50 if XP doesn't exist
    };

    // Save the updated user document
    await user.save();

    // Respond with a success message and updated stats
    return res.status(200).json({
      message: "User enrolled successfully!",
      enrolledCourses: user.enrolledCourses,
      stats: user.stats, // Include updated stats in the response
    });
  } catch (error) {
    console.error("Error enrolling user:", error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};



export const getEnrolledCourses = async (req, res) => {
    const { userId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
  
    try {
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ enrolledCourses: user.enrolledCourses });
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      return res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };
  
  export const deleteEnrolledCourse = async (req, res) => {
    const { userId, courseId } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid userId or courseId" });
    }
  
    try {
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find the course in the user's enrolledCourses array
      const courseIndex = user.enrolledCourses.findIndex(
        (enrolledCourse) => enrolledCourse.courseId.toString() === courseId.toString()
      );

      console.log("Received courseId:", courseId);
      console.log("Enrolled Courses:", user.enrolledCourses);
  
      if (courseIndex === -1) {
        return res.status(404).json({ message: "User is not enrolled in this course" });
      }
  
      // Remove the course from the enrolledCourses array
      user.enrolledCourses.splice(courseIndex, 1);
      await user.save();
  
      return res.status(200).json({
        message: "Course removed successfully",
        enrolledCourses: user.enrolledCourses,
      });
    } catch (error) {
      console.error("Error deleting enrolled course:", error);
      return res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };

  


  