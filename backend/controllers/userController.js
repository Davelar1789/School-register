import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({ fullName, email, password });
    await user.save();

    // Return user info with token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        schoolId: user.schoolId,  // Include schoolId
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  