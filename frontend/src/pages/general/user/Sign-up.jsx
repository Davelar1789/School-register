import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./Signup.modules.css";

function UserSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/users/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleButton = (
    <button
      type="button"
      className="su-toggle"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  );

  return (
    <div className="su-page">
      <div className="su-blob su-blob-1" />
      <div className="su-blob su-blob-2" />
      <div className="su-blob su-blob-3" />

      <button type="button" className="su-back" onClick={() => navigate("/")}>
        <FaArrowLeft aria-hidden="true" /> Back
      </button>

      <div className="su-card">
        <div className="su-badge">
          <span className="su-badge-dot" />
          Free to start
        </div>
        <h1 className="su-title">Create your account</h1>
        <p className="su-subtitle">
          Sign up to manage attendance, results and messages in one place.
        </p>

        <form onSubmit={handleSubmit} className="su-form">
          <div className="su-field">
            <label htmlFor="fullName">Full name</label>
            <div className="su-input-wrap">
              <input
                id="fullName"
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="Ama Mensah"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="su-field">
            <label htmlFor="email">Email address</label>
            <div className="su-input-wrap">
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@school.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="su-field">
            <label htmlFor="password">Password</label>
            <div className="su-input-wrap has-toggle">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {toggleButton}
            </div>
          </div>

          <div className="su-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className={`su-input-wrap${mismatch ? " is-invalid" : ""}`}>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={mismatch}
                aria-describedby={mismatch ? "confirm-error" : undefined}
                required
              />
            </div>
            {mismatch && (
              <p id="confirm-error" className="su-error" role="alert">
                Passwords don't match yet.
              </p>
            )}
          </div>

          <button type="submit" className="su-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="su-login">
          Already have an account? <Link to="/sign-in">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default UserSignUp;