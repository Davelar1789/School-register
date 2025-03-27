import User from "../../../models/User.model.js";

export const stuff = async (req, res, next) => {
  try {
    // Use the $in operator to match either "admin" or "TEACHER"
    const users = await User.find({ role: { $in: ["admin", "TEACHER"] } });

    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};
