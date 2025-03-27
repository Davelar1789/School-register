export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};
