import User from "../../../models/User.model.js";

export const totalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.find();

    return res.status(200).json({
      data: totalUsers,
      message: "Number of Total Users Retrieved",
    });
  } catch (error) {
    next(error);
  }
};
