import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
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
  const [focusedInput, setFocusedInput] = useState("");

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
        await api.get("/ping");
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
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", user.token);

        // Store user info & token for offline login
        localStorage.setItem(
          "offlineAdmin",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
            token: user.token,
            role: user.role,
            name: user.name,
            userId: user._id,
          })
        );

        setTimeout(() => {
          if (user?.role === "superadmin") navigate("/superadmin/");
          else navigate("/dashboard");
          // else navigate("/teacher-dashboard2");
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
    <div className="login-page">
      {/* Background Elements */}
      <div className="login-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" />
        <span>Back to Home</span>
      </button>

      {/* Login Container */}
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-icon">
              <FaUserShield />
            </div>
            <h1 className="brand-title">Admin Portal</h1>
            <p className="brand-description">
              Manage your educational institution with powerful tools and insights. 
              Your secure gateway to comprehensive school management.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Secure Authentication</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Offline Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-wrapper">
            <div className="form-header">
              <h2 className="form-title">Welcome Back!</h2>
              <p className="form-subtitle">Sign in to your admin account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Input */}
              <div className={`input-group ${focusedInput === 'email' ? 'focused' : ''}`}>
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput('')}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className={`input-group ${focusedInput === 'password' ? 'focused' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput('')}
                    required
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="form-footer">
              <p className="footer-text">
                Not an admin? 
                <Link to="/teacher-login" className="footer-link">Login as Teacher</Link>
              </p>
            </div>

            {/* Divider
            <div className="divider">
              <span>or</span>
            </div> */}

            {/* Additional Info
            <div className="additional-info">
              <p>Need help accessing your account?</p>
              <a href="#contact" className="help-link">Contact Support</a>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;