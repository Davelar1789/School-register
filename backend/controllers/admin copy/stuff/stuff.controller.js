import User from "../../../models/User.model.js";

export const stuff = async (req, res, next) => {
  try {
    const users = await User.find({ role: "admin" });

    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};
