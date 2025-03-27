import React, { useState } from "react";
import axios from "axios";
import contactbag from '../../../assets/images/contactbag.jpg';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./ForgotPassword.modules.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
      navigate("/sign-in");
    } catch (err) {
      console.error("Error sending reset password email", err);
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className="password-page" style={{ backgroundImage: `url(${contactbag})` }}>
    <div className="flex flex-col items-center justify-center h-screen px-4 md:px-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Forgot Password
        </h2>
        <p className="text-center mb-6 text-gray-600">
          Enter your email address to receive a password reset link.
        </p>
        <form onSubmit={handleResetPassword}>
          <div className="flex flex-col mb-4">
            <label htmlFor="email" className="text-sm text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md p-2 mt-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-700 text-white py-2 px-4 rounded-lg w-full"
          >
            Reset Password
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 text-sm">
  Remembered your password?{" "}
  <a href="/sign-in" className="text-blue-700">
    Sign In
  </a>
</p>
      </div>
    </div>
    </div>
  );
}
