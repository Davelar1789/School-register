// File: verifyTeacher.js
export const verifyTeacher = (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Forbidden: Teacher access required" });
  }
  next();
};