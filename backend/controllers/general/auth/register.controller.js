import User from "../../../models/User.model.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, role = "student" } = req.body;

    // Trim inputs to avoid accidental errors
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // console.log("Raw Password Provided:", trimmedPassword);
    
    // Check for missing fields
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    // Check if passwords match
    if (trimmedPassword !== trimmedConfirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // console.log("Raw Password Before Hashing:", password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    // console.log("Hashed Password Before Storing:", hashedPassword);

    // Create a new user
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({ data: newUser, message: "User created successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    next(error); // Pass errors to global error handler
  }
};
