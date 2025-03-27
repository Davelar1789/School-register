import User from "../../models/User.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
