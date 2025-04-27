import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./addAdmin.modules.css";
import Header2 from "../../../components/Header3";
import Sidebar from "../../../components/Sidebar2";

function UserSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/users/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Account created successfully!");
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-container">
    {/* Sidebar */}
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

    {/* Main Content */}
    <div className="superadmin-main">
      {/* Header */}
      <Header2 toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

    <div className="signup-container">
      {/* Back Button */}
      {/* <div className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back
      </div> */}

      <div className="signup-form-container">
        <h2 className="signup-title">Create An Admin</h2>
        {/* <p className="signup-subtitle">Sign up to start managing schools.</p> */}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* <p className="login-link">
          Already have an account? <Link to="/sign-in">Login here</Link>
        </p> */}
      </div>
    </div>
    </div>
    </div>
  );
}

export default UserSignUp;
