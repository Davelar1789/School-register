import User from "../models/User.model.js";
import School from "../models/School.model.js";
import jwt from "jsonwebtoken";
import Teacher from "../models/Teacher.model.js"; // adjust path if needed
import asyncHandler from "express-async-handler";

// Generate JWT Token with schoolId
const generateToken = ({ id, fullName, role, schoolName, schoolId }) => {
  return jwt.sign({ id, fullName, role, schoolName, schoolId }, process.env.JWT_SECRET, {
    expiresIn: "6h",
  });
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if email exists in User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use by a system user" });
    }

    // Check if email exists in Teacher model
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email is already in use by a teacher" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    // Try to find associated school (optional)
    const school = await School.findOne({ user: user._id });
    const schoolId = school?._id || null;
    const schoolName = school?.name || "Unknown School";

    const token = generateToken({
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      schoolName,
      schoolId,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        schoolId,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let schoolName = "Unknown School";
    let schoolId = null;

    if (user.schoolId) {
      const school = await School.findById(user.schoolId);
      if (school) {
        schoolName = school.name;
        schoolId = school._id;
      }
    }

    const token = generateToken({
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      schoolName,
      schoolId,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        schoolId,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get total number of users
export const getUserCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ count: userCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user count." });
  }
};

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout user
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
