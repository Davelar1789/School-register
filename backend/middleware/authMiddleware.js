import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Protect routes (Ensure user is logged in)
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token." });
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
