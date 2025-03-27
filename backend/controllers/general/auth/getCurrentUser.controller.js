import User from "../../../models/User.model.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId);

    return res
      .status(200)
      .json({ data: currentUser, message: "User Information retrieved" });
  } catch (error) {
    next(error);
  }
};
