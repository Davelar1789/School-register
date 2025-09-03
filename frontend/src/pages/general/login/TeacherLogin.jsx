import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { sha256 } from "js-sha256"; // hash library
import "./Sign-in.modules.css";

function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

// Detect offline/online status
useEffect(() => {
  const handleOffline = () => setOfflineMode(true);
  const handleOnline = () => setOfflineMode(false);

  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);

  // Set initial offlineMode based on navigator status
  setOfflineMode(!navigator.onLine);

  return () => {
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  };
}, []);

const handleEmailSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const cachedTeacher = JSON.parse(localStorage.getItem("teacher"));
  
  // Try to "ping" your API to confirm online status
  let isOnline = true;
  try {
    await api.get("/ping"); // a lightweight endpoint just to check connectivity
  } catch (err) {
    isOnline = false;
    console.log("API unreachable. Switching to offline mode:", err.message);
  }

  if (!isOnline) {
    if (cachedTeacher && cachedTeacher.email.toLowerCase().trim() === email.toLowerCase().trim()) {
      setTeacher({ ...cachedTeacher, usage: "cached" });
      setStep(3);
      toast.success("Offline mode. Enter your password");
      console.log("Offline login allowed with cached credentials.");
    } else {
      toast.error("No credentials found. Log in online at least once.");
      console.log("Offline login blocked: no cached credentials.");
    }
    setLoading(false);
    return;
  }

  // Online verification
  try {
    const res = await api.post("/api/teachers/verify-email", { email });
    const { usage, teacher } = res.data;
    setTeacher({ ...teacher, usage });
    setStep(usage === "not used" ? 2 : 3);
    console.log("Online login step:", usage === "not used" ? 2 : 3);
  } catch (err) {
    toast.error(err.response?.data?.message || "Email not found. Please try again.");
    console.log("Online email verification failed:", err.message);
  } finally {
    setLoading(false);
  }
};


const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isFirstTime = teacher?.usage === "not used";
      const isOfflineCached = teacher?.usage === "cached";

      let online = true;
      try {
        await api.get("/ping");
      } catch (err) {
        online = false;
        console.log("API unreachable during login:", err.message);
      }

      if (!online && isOfflineCached) {
        // Offline login
        const passwordHash = sha256(password);
        if (passwordHash === teacher.passwordHash) {
          if (teacher.token) localStorage.setItem("token", teacher.token);
          toast.success("Logged in offline. Some features may be limited.");
          navigate("/teacher-dashboard");
        } else {
          toast.error("Offline login failed. Wrong password.");
        }
      } else if (online) {
        // Online login
        const payload = isFirstTime
          ? { email, staffId, password }
          : { email, password };
        const endpoint = isFirstTime
          ? "/api/teachers/setup"
          : "/api/teachers/login";

        const res = await api.post(endpoint, payload);
        const teacherData = res.data.teacher;

        localStorage.removeItem("teacher");
        localStorage.removeItem("token");

        const passwordHash = sha256(password);
        localStorage.setItem(
          "teacher",
          JSON.stringify({ ...teacherData, passwordHash })
        );
        localStorage.setItem("token", teacherData.token);

        toast.success("Login successful!");

        // Show version modal instead of direct navigation
        if (!localStorage.getItem("version2Seen")) {
          setShowVersionModal(true);
        } else {
          navigate("/teacher-dashboard");
        }
      } else {
        toast.error("Cannot reach server");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVersionModal = () => {
    localStorage.setItem("version2Seen", "true"); // prevent showing again
    setShowVersionModal(false);
    navigate("/teacher-dashboard");
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
      {showVersionModal && (
  <div className="version-modal-overlay">
    <div className="version-modal">
      <div className="version-header">
        <h2>🎉 Version 2.0 is Here!</h2>
        <p className="version-subtitle">
          Discover the latest improvements and features.
        </p>
      </div>

      <div className="version-body">
        <ul>
          <li>🚀 Offline login available now (lasts for a week. Meaning you connect with data on Monday and enjoy offline access the rest of the week)</li>
          <li>🛡 Improved security and faster login</li>
          <li>⚡ Smarter attendance marking</li>
        </ul>
      </div>

      <div className="version-footer">
        <button
          className="version-button"
          onClick={handleCloseVersionModal}
        >
          Continue to Dashboard →
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default TeacherLogin;
