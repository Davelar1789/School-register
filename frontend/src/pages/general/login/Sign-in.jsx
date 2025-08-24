import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./Sign-in.modules.css";

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let isOnline = false;

    // Ping the server to check online status
    try {
      await api.get("/ping"); // Make sure your backend has a /ping endpoint returning 200 OK
      isOnline = true;
    } catch {
      isOnline = false;
    }

    if (isOnline) {
      // Online login
      const response = await api.post("/api/users/login", {
        email: formData.email,
        password: formData.password,
      });

      if (!response.data || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      const user = response.data.user;

      toast.success("Login successful! Redirecting...");

      // Store user info & token for offline login
      localStorage.setItem(
        "offlineAdmin",
        JSON.stringify({
          email: formData.email,
          password: formData.password, // Optional if you want offline password check
          token: user.token,
          role: user.role,
          name: user.name,
          userId: user._id,
        })
      );

      setTimeout(() => {
        if (user?.role === "superadmin") navigate("/superadmin/");
        else navigate("/dashboard");
      }, 1500);

    } else {
      // Offline login
      const cached = JSON.parse(localStorage.getItem("offlineAdmin"));

      if (!cached || cached.email !== formData.email || !cached.token) {
        throw new Error("No offline credentials found or email mismatch");
      }

      toast.success("Offline login successful! Redirecting...");

      localStorage.setItem("token", cached.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: cached.userId,
          name: cached.name,
          email: cached.email,
          role: cached.role,
          token: cached.token,
        })
      );

      setTimeout(() => {
        if (cached?.role === "superadmin") navigate("/superadmin/");
        else navigate("/dashboard");
      }, 1500);
    }
  } catch (err) {
    console.error("Login Error:", err);
    toast.error("Invalid email/password or cannot login offline.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      {/* Back Button */}
      <div className="back-button3" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <div className="login-form-container">
        <h2 className="login-title">Welcome Back Admin!</h2>
        <p className="login-subtitle">Log in to manage your account.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group3">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group3">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-link">
          Not an admin? <Link to="/teacher-login">Login as Teacher</Link>
        </p>
      </div>
    </div>
  );
}

export default UserLogin;
