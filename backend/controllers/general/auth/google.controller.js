import User from "../../../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const google = async (req, res, next) => {
  try {
    const { email, profilePicture, username } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const { password: pass, ...rest } = user._doc;

      res
        .cookie("token", token, { httpOnly: true, secure: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const newUser = await User.create({
        email,
        password: hashedPassword,
        isEmailVerified: true,
        profilePicture,
        username,
      });

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const { password: pass, ...rest } = newUser._doc;

      res
        .cookie("token", token, { httpOnly: true, secure: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
