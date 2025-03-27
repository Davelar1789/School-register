import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../../api/axios";
import "./SignUp.modules.css";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    headmasterName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/schools/register", formData);
      console.log("Registration Success:", response.data);
      navigate("/dashboard"); // Redirect to dashboard after success
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <div className="signup-form-container">
        <h2 className="signup-title">Register Your School</h2>
        <p className="signup-subtitle">
          Enter your school's details to get started.
        </p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label>School Name</label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
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
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>School Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Headmaster's Name</label>
            <input
              type="text"
              name="headmasterName"
              value={formData.headmasterName}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
