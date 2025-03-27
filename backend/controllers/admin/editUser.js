import User from "../../models/User.model.js";

export const editUser = async (req, res) => {
  try {
    const { id, name, email, role } = req.body;

    // Find the user by ID and update
    const user = await User.findByIdAndUpdate(id, { name, email, role }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
