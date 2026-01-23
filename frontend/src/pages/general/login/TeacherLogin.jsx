import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaLock, FaIdCard, FaChalkboardTeacher, FaWifi, FaExclamationTriangle } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { sha256 } from "js-sha256";
import "./TeacherLogin.modules.css";

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
  const [focusedInput, setFocusedInput] = useState("");

  // Detect offline/online status
  useEffect(() => {
    const handleOffline = () => setOfflineMode(true);
    const handleOnline = () => setOfflineMode(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
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
    
    let isOnline = true;
    try {
      await api.get("/ping");
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
        const passwordHash = sha256(password);
        if (passwordHash === teacher.passwordHash) {
          if (teacher.token) localStorage.setItem("token", teacher.token);
          toast.success("Logged in offline. Some features may be limited.");
          navigate("/teacher-dashboard");
        } else {
          toast.error("Offline login failed. Wrong password.");
        }
      } else if (online) {
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
        navigate("/teacher-dashboard");
      } else {
        toast.error("Cannot reach server");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVersionModal = () => {
    localStorage.setItem("version2Seen", "true");
    setShowVersionModal(false);
    navigate("/teacher-dashboard");
  };

  return (
    <div className="teacher-login-page">
      {/* Background Elements */}
      <div className="login-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Connection Status Indicator */}
      <div className={`connection-status ${offlineMode ? 'offline' : 'online'}`}>
        {offlineMode ? <FaExclamationTriangle /> : <FaWifi />}
        <span>{offlineMode ? 'Offline Mode' : 'Online'}</span>
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
              <FaChalkboardTeacher />
            </div>
            <h1 className="brand-title">Teacher Portal</h1>
            <p className="brand-description">
              Access your teaching dashboard to manage classes, track attendance, 
              and engage with students. Your digital classroom awaits.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Offline Access Available</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Smart Attendance Marking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Student Performance Tracking</span>
              </div>
            </div>
            {offlineMode && (
              <div className="offline-notice">
                <FaExclamationTriangle />
                <p>You're currently offline. Login with previously used credentials to continue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-wrapper">
            <div className="form-header">
              <h2 className="form-title">
                {step === 1 && "Welcome Teacher!"}
                {step === 2 && "Setup Your Account"}
                {step === 3 && "Welcome Back!"}
              </h2>
              <p className="form-subtitle">
                {step === 1 && "Enter your email to get started"}
                {step === 2 && "Create your credentials to access your account"}
                {step === 3 && "Enter your password to continue"}
              </p>
              
              {/* Step Indicator */}
              <div className="step-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
                <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
                <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
                <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
              </div>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="login-form">
                <div className={`input-group ${focusedInput === 'email' ? 'focused' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput('')}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Setup (First Time) */}
            {step === 2 && (
              <form onSubmit={handleLogin} className="login-form">
                <div className={`input-group ${focusedInput === 'staffId' ? 'focused' : ''}`}>
                  <label htmlFor="staffId">Staff ID</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="staffId"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      onFocus={() => setFocusedInput('staffId')}
                      onBlur={() => setFocusedInput('')}
                      required
                    />
                  </div>
                </div>

                <div className={`input-group ${focusedInput === 'password' ? 'focused' : ''}`}>
                  <label htmlFor="password">Create Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput('')}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Setting up...
                    </>
                  ) : (
                    <>
                      Create & Login
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: Login */}
            {step === 3 && (
              <form onSubmit={handleLogin} className="login-form">
                <div className={`input-group ${focusedInput === 'password' ? 'focused' : ''}`}>
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput('')}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
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
            )}

            {/* Footer */}
            <div className="form-footer">
              <p className="footer-text">
                Not yet registered? Contact your admin for access.
              </p>
            </div>
             <div className="form-footer">
                          <p className="footer-text">
                            Not a teacher? 
                            <Link to="/sign-in" className="footer-link">Login as Admin</Link>
                          </p>
                        </div>
          </div>
        </div>
      </div>

      {/* Version Modal */}
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
                <li>🚀 Offline login available now (lasts for a week)</li>
                <li>🛡 Improved security and faster login</li>
                <li>⚡ Smarter attendance marking</li>
                <li>📊 Enhanced performance tracking</li>
              </ul>
            </div>
            <div className="version-footer">
              <button className="version-button" onClick={handleCloseVersionModal}>
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