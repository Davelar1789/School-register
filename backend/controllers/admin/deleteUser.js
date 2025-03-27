import User from "../../models/User.model.js";

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
