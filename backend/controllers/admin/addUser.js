// import User from "../../models/User.model.js";
// import bcrypt from "bcryptjs";

// export const addUsers = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create a new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     // Save the user
//     const savedUser = await newUser.save();

//     res.status(201).json({ message: "User added successfully", user: savedUser });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// };
