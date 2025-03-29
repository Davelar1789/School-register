import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./ChangePassword.modules.css";

export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [view, setView] = useState("request"); // 'request' for first card, 'sent' for second
  const [countdown, setCountdown] = useState(30); // 30 seconds countdown
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
      setView("sent");
      setIsCountdownActive(true); // Start countdown
    } catch (err) {
      console.error("Error sending reset password email", err);
      toast.error("Failed to send reset email");
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Reset link resent");
      setCountdown(30); // Reset countdown
      setIsCountdownActive(true); // Start countdown again
    } catch (err) {
      console.error("Error resending reset email", err);
      toast.error("Failed to resend email");
    }
  };

  useEffect(() => {
    let timer;
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false); // Stop countdown
    }
    return () => clearTimeout(timer);
  }, [countdown, isCountdownActive]);

  return (
    <div className="change-password-page">
      <div className={`card-container ${view === "sent" ? "swipe-left" : ""}`}>
        {view === "request" && (
          <div className="reset-card">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
              Change Password
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
                Send Reset Link
              </button>
            </form>
          </div>
        )}

        {view === "sent" && (
          <div className="sent-card">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
              Email Sent
            </h2>
            <p className="text-center mb-6 text-gray-600">
              A password reset link has been sent to your email.
            </p>
            <p className="text-center text-gray-500">
              {isCountdownActive
                ? `Resend code in ${countdown} seconds`
                : "Didn't receive the email?"}
            </p>
            <button
              onClick={handleResendCode}
              disabled={isCountdownActive}
              className={`bg-blue-700 text-white py-2 px-4 rounded-lg w-full mt-4 ${
                isCountdownActive ? "disabled-button" : ""
              }`}
            >
              Resend Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
