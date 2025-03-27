import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import login from "../../../assets/images/loginimage.jpg";
import api from "../../../api/axios"; // Importing the centralized API configuration
import toast from "react-hot-toast";
import './Sign-in.modules.css';

export default function SignIn() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the button is clicked
    try {
      const response = await api.post("/api/auth/login", data);
      localStorage.setItem("token", response.data.token);
      toast.success("Sign in successful");
      navigate("/admin/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // Set loading back to false after request completes
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="signin-page"
    style={{
      backgroundImage: `url(${login})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
        backgroundBlendMode: "darken",
    }}>
      <div className="signin-card">
        <p className='welcome'>Welcome Back</p>
        <form onSubmit={handleSignIn} className="signin-form">
          <input
            type="email"
            placeholder="Email"
            id="email"
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
          <button
            type="submit"
            className="signin-button"
            disabled={loading} // Disable the button when loading
          >
            {loading ? "Loading..." : "Sign In"} {/* Change button text */}
          </button>
        </form>
        <p
          className="forgot-password"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </p>
        <p>
          Don't have an account?{" "}
          <Link to="/sign-up" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
