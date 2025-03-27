import User from "../../../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../../../utils/error.js";

export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // Trim inputs to prevent accidental errors
    email = email.trim().toLowerCase();
    password = password.trim();

    // console.log("Password provided in request:", password);

    // Check if email and password are provided
    if (!email || !password) {
      return next(errorHandler(400, "Fill in all fields"));
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(400, "User not found"));
    }

    // Log the stored hashed password for debugging
    // console.log("Stored hashed password:", user.password);

    // Manually check if password hashes match
    // const testHash = await bcrypt.hash(password, 10);
    // console.log("Newly Hashed Password (for debugging):", testHash);

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    // console.log("Password Match Result:", isPasswordMatch);

    if (!isPasswordMatch) {
      return next(errorHandler(400, "Invalid password"));
    }

    // Create token with user ID and role
    const tokenData = { id: user._id, role: user.role };
    // console.log("Signing with JWT_SECRET:", process.env.JWT_SECRET);

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      return next(errorHandler(500, "JWT secret is missing"));
    }

    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "24h" });
    // console.log("Created JWT Token:", token);

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    // Exclude password from the user data sent in the response
    const { password: _, ...userData } = user._doc;

    // Send response with user data and role
    return res.status(200).json({
      data: { ...userData, role: user.role },
      token,
      message: "User logged in successfully",
    });

  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};
