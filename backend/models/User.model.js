// Import required modules
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

// Define constants for roles
const USER_ROLES = ["admin", "student", "teacher", "customer"];

// Define the User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    profilePicture: {
      type: String,
      default:
        "https://t3.ftcdn.net/jpg/03/53/11/00/360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
      default: "student",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    attendance: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Attendance must be an integer value.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false, // Disable __v field
  }
);

// // Pre-save middleware to hash passwords
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // Instance method to validate password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

// Create and export the User model
const User = model("User", userSchema);

export default User;
