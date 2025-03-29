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
      const response = await api.post("/api/users/login", {
        email: formData.email,
        password: formData.password,
      });

      toast.success("Login successful! Redirecting...");
      
      // Save token to localStorage (or context)
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.user.token);

      setTimeout(() => {
        if (user.role === "superadmin") {
          navigate("/superadmin/");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Invalid email or password.");
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
        <h2 className="login-title">Welcome Back!</h2>
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
          Don't have an account? <Link to="/sign-up">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default UserLogin;
