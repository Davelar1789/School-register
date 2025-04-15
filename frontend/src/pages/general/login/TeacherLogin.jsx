import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./Sign-in.modules.css";

function TeacherLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    teacherId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/teachers/login", {
        email: formData.email,
        teacherId: formData.teacherId,
      });

      if (!response.data || !response.data.teacher) {
        throw new Error("Invalid credentials");
      }

      const teacher = response.data.teacher;

      toast.success("Login successful! Redirecting...");
      localStorage.setItem("teacher", JSON.stringify(teacher));
      localStorage.setItem("token", teacher.token);

      setTimeout(() => {
        navigate("/teacher/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Invalid email or teacher ID.");
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
        <h2 className="login-title">Teacher Login</h2>
        <p className="login-subtitle">Enter your registered email and teacher ID.</p>

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
            <label>Teacher ID</label>
            <input
              type="text"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-link">
          Not yet registered? Contact your admin.
        </p>
      </div>
    </div>
  );
}

export default TeacherLogin;
