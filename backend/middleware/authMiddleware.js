import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Teacher from "../models/Teacher.model.js"; // <-- Import Teacher


// Protect routes (Ensure user is logged in)
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      // Optional: check role to determine where to find the user
      if (decoded.role === "Teacher") {
        user = await Teacher.findById(decoded.id).select("-password");
      } else {
        user = await User.findById(decoded.id).select("-password");
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log("Decoded token or error reason:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
      }
      return res.status(401).json({ message: "Not authorized, invalid token." });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token." });
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
