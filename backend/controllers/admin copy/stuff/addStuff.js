import User from "../../../models/User.model.js";

export const addStuff = async (req, res, next) => {
  try {
    const { id, ...reqBody } = req.body;
    const users = await User.findByIdAndUpdate(id, reqBody);

    return res.status(200).json({
      // data: users,
      message: "Stuff Added",
    });
  } catch (error) {
    next(error);
  }
};
