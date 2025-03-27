import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import login from "../../../assets/images/loginimage.jpg";
import api from "../../../api/axios"; // Importing the centralized API configuration
import toast from "react-hot-toast";
import "./Signup.modules.css"; 

export default function SignUp() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false); // Loading state

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true); // Start loading
    try {
      await api.post("/api/auth/register", data);
      toast.success("Sign up successful");
      navigate("/sign-in");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div 
      className="signup-page"
      style={{
        backgroundImage: `url(${login})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
        backgroundBlendMode: "darken",
      }}
    >
      <div className="signup-card">
        <p className="welcome">Create an Account With Us</p>
        <form onSubmit={handleSignUp} className="signup-form">
          <input
            type="email"
            placeholder="Email"
            id="email"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Username"
            id="username"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            id="password"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            id="confirmPassword"
            onChange={handleChange}
            required
          />
          <button 
            type="submit" 
            className="signup-button" 
            disabled={loading} // Disable button when loading
          >
            {loading ? "Loading..." : "Sign Up"} {/* Change button text */}
          </button>
        </form>
        <p>Already have an account? <Link to="/sign-in" className="signin-link">Sign In</Link></p>
      </div>
    </div>
  );
}
