import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./Sign-in.modules.css";

function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = enter email, 2 = set staffId + password, 3 = enter password
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/teachers/verify-email", { email });
      const { usage, teacher } = res.data;
      setTeacher({ ...teacher, usage });

      if (usage === "not used") {
        setStep(2); // New teacher – ask for staffId and create password
      } else {
        setStep(3); // Returning teacher – just ask for password
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const isFirstTime = teacher?.usage === "not used";
  
      const payload = isFirstTime
        ? { email, staffId, password } // for first-time setup
        : { email, password };         // for normal login
  
      const endpoint = isFirstTime
        ? "/api/teachers/first-time-setup"
        : "/api/teachers/login";
  
      const res = await api.post(endpoint, payload);
  
      toast.success("Login successful!");
      localStorage.setItem("teacher", JSON.stringify(res.data.teacher));
      localStorage.setItem("token", res.data.teacher.token);
      navigate("/teacher/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="back-button3" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back
      </div>

      <div className="login-form-container">
        <h2 className="login-title">Teacher Login</h2>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="input-group3">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Checking..." : "Next"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group3">
              <label>Staff ID</label>
              <input
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
              />
            </div>
            <div className="input-group3">
              <label>Create Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Setting Password..." : "Create & Login"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group3">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        <p className="signup-link">Not yet registered? Contact your admin.</p>
      </div>
    </div>
  );
}

export default TeacherLogin;
