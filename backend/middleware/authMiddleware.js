import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Teacher from "../models/Teacher.model.js";

// authToken middleware (for cookie-based auth)
export const authToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.error("Token Expired:", err.message);
          return res.status(401).json({ message: "Token has expired" });
        }

        console.error("Token Authentication Error:", err.message);
        return res.status(403).json({ message: "Invalid or tampered token" });
      }

      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error("Error in authToken middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Protect routes - reads from cookies OR Authorization header
export const protect = async (req, res, next) => {
  let token;

  // Check cookies first, then Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === "Teacher") {
      user = await Teacher.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      user.role = "teacher";

      console.log("👨‍🏫 Teacher authenticated:", {
        id: user._id,
        email: user.email,
        school: user.school,
        role: user.role,
      });
    } else {
      user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("👤 User authenticated:", {
        id: user._id,
        email: user.email,
        role: user.role,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Token error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Not authorized, invalid token." });
  }
};

// Check if user is a SuperAdmin
export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. SuperAdmin only." });
  }
};