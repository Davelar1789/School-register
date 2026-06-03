import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaEnvelope, FaLock, FaIdCard,
  FaChalkboardTeacher, FaWifi, FaExclamationTriangle
} from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { sha256 } from "js-sha256";
import "./TeacherLogin.modules.css";

const FEATURES = [
  { emoji: "📶", label: "Offline Access Available" },
  { emoji: "✅", label: "Smart Attendance Marking" },
  { emoji: "📊", label: "Student Performance Tracking" },
];

const STEPS = [
  { n: 1, label: "Email" },
  { n: 2, label: "Setup" },
  { n: 3, label: "Login" },
];

function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [staffId, setStaffId]   = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep]         = useState(1);
  const [teacher, setTeacher]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [focused, setFocused]   = useState("");

  useEffect(() => {
    const onOffline = () => setOfflineMode(true);
    const onOnline  = () => setOfflineMode(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online",  onOnline);
    setOfflineMode(!navigator.onLine);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online",  onOnline);
    };
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const cachedTeacher = JSON.parse(localStorage.getItem("teacher"));
    let isOnline = true;
    try { await api.get("/ping"); } catch { isOnline = false; }

    if (!isOnline) {
      if (cachedTeacher && cachedTeacher.email.toLowerCase().trim() === email.toLowerCase().trim()) {
        setTeacher({ ...cachedTeacher, usage: "cached" });
        setStep(3);
        toast.success("Offline mode. Enter your password");
      } else {
        toast.error("No credentials found. Log in online at least once.");
      }
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/teachers/verify-email", { email });
      const { usage, teacher } = res.data;
      setTeacher({ ...teacher, usage });
      setStep(usage === "not used" ? 2 : 3);
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
      const isFirstTime      = teacher?.usage === "not used";
      const isOfflineCached  = teacher?.usage === "cached";
      let online = true;
      try { await api.get("/ping"); } catch { online = false; }

      if (!online && isOfflineCached) {
        const hash = sha256(password);
        if (hash === teacher.passwordHash) {
          if (teacher.token) localStorage.setItem("token", teacher.token);
          toast.success("Logged in offline. Some features may be limited.");
          navigate("/teacher-dashboard");
        } else {
          toast.error("Offline login failed. Wrong password.");
        }
      } else if (online) {
        const payload  = isFirstTime ? { email, staffId, password } : { email, password };
        const endpoint = isFirstTime ? "/api/teachers/setup" : "/api/teachers/login";
        const res = await api.post(endpoint, payload);
        const teacherData = res.data.teacher;
        localStorage.removeItem("teacher");
        localStorage.removeItem("token");
        localStorage.setItem("teacher", JSON.stringify({ ...teacherData, passwordHash: sha256(password) }));
        localStorage.setItem("token", teacherData.token);
        toast.success("Login successful!");
        navigate("/teacher-dashboard");
      } else {
        toast.error("Cannot reach server");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVersionModal = () => {
    localStorage.setItem("version2Seen", "true");
    setShowVersionModal(false);
    navigate("/teacher-dashboard");
  };

  const stepTitle = {
    1: "Welcome, Teacher!",
    2: "Set Up Your Account",
    3: "Welcome Back!",
  };
  const stepSub = {
    1: "Enter your school email address to continue.",
    2: "First time? Create your credentials below.",
    3: "Enter your password to access your dashboard.",
  };

  return (
    <div className="tl-page">
      {/* Ambient blobs */}
      <div className="tl-blob tl-blob-1" />
      <div className="tl-blob tl-blob-2" />
      <div className="tl-blob tl-blob-3" />

      {/* Connection pill */}
      <div className={`tl-conn ${offlineMode ? "tl-offline" : "tl-online"}`}>
        {offlineMode ? <FaExclamationTriangle /> : <FaWifi />}
        <span>{offlineMode ? "Offline Mode" : "Online"}</span>
      </div>

      {/* Back */}
      <button className="tl-back" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back to Home
      </button>

      {/* Card */}
      <div className="tl-card">

        {/* ── Left panel ── */}
        <div className="tl-panel tl-left">
          <div className="tl-brand-icon">
            <FaChalkboardTeacher />
          </div>
          <h1 className="tl-brand-title">Teacher Portal</h1>
          <p className="tl-brand-desc">
            Your digital classroom — manage classes, mark attendance, and keep
            track of every student's journey, even offline.
          </p>

          <ul className="tl-features">
            {FEATURES.map((f, i) => (
              <li key={i} className="tl-feature-item">
                <span className="tl-feat-emoji">{f.emoji}</span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          {offlineMode && (
            <div className="tl-offline-notice">
              <FaExclamationTriangle />
              <p>You're offline. Use previously saved credentials to log in.</p>
            </div>
          )}

          {/* Decorative dots */}
          <div className="tl-deco-dots">
            {[...Array(12)].map((_, i) => <span key={i} className="tl-dot" />)}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="tl-panel tl-right">

          {/* Step indicator */}
          <div className="tl-steps">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className={`tl-step ${step >= s.n ? "tl-step-active" : ""} ${step > s.n ? "tl-step-done" : ""}`}>
                  <span className="tl-step-num">{step > s.n ? "✓" : s.n}</span>
                  <span className="tl-step-label">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`tl-step-line ${step > s.n ? "tl-line-active" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <h2 className="tl-form-title">{stepTitle[step]}</h2>
          <p className="tl-form-sub">{stepSub[step]}</p>

          {/* Step 1 */}
          {step === 1 && (
            <form className="tl-form" onSubmit={handleEmailSubmit}>
              <div className={`tl-field ${focused === "email" ? "tl-field-focus" : ""}`}>
                <label htmlFor="email">Email Address</label>
                <div className="tl-input-wrap">
                  <FaEnvelope className="tl-input-icon" />
                  <input
                    type="email" id="email" value={email}
                    placeholder="teacher@school.edu.gh"
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    required
                  />
                </div>
              </div>
              <button className="tl-submit" type="submit" disabled={loading}>
                {loading ? <><span className="tl-spinner" /> Checking…</> : <>Continue <span>→</span></>}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form className="tl-form" onSubmit={handleLogin}>
              <div className={`tl-field ${focused === "staffId" ? "tl-field-focus" : ""}`}>
                <label htmlFor="staffId">Staff ID</label>
                <div className="tl-input-wrap">
                  <FaIdCard className="tl-input-icon" />
                  <input
                    type="text" id="staffId" value={staffId}
                    placeholder="e.g. TCH-00421"
                    onChange={e => setStaffId(e.target.value)}
                    onFocus={() => setFocused("staffId")}
                    onBlur={() => setFocused("")}
                    required
                  />
                </div>
              </div>
              <div className={`tl-field ${focused === "password" ? "tl-field-focus" : ""}`}>
                <label htmlFor="password">Create Password</label>
                <div className="tl-input-wrap">
                  <FaLock className="tl-input-icon" />
                  <input
                    type="password" id="password" value={password}
                    placeholder="Choose a strong password"
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    required
                  />
                </div>
              </div>
              <button className="tl-submit" type="submit" disabled={loading}>
                {loading ? <><span className="tl-spinner" /> Setting up…</> : <>Create & Login <span>→</span></>}
              </button>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form className="tl-form" onSubmit={handleLogin}>
              <div className={`tl-field ${focused === "password" ? "tl-field-focus" : ""}`}>
                <label htmlFor="password">Password</label>
                <div className="tl-input-wrap">
                  <FaLock className="tl-input-icon" />
                  <input
                    type="password" id="password" value={password}
                    placeholder="Enter your password"
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    required
                  />
                </div>
              </div>
              <button className="tl-submit" type="submit" disabled={loading}>
                {loading ? <><span className="tl-spinner" /> Signing in…</> : <>Sign In <span>→</span></>}
              </button>
            </form>
          )}

          <div className="tl-footer-links">
            <p>Not yet registered? <span className="tl-muted">Contact your school admin.</span></p>
            <p>Not a teacher? <Link to="/sign-in" className="tl-link">Login as Admin →</Link></p>
            {/* <p><Link to="/forgot-password" className="tl-link">Forgot password</Link></p> */}
          </div>
        </div>
      </div>

      {/* Version modal */}
      {showVersionModal && (
        <div className="tl-modal-overlay">
          <div className="tl-modal">
            <div className="tl-modal-head">
              <span className="tl-modal-emoji">🎉</span>
              <h2>Version 2.0 is Here!</h2>
              <p>Discover the latest improvements.</p>
            </div>
            <ul className="tl-modal-list">
              <li>🚀 Offline login (lasts up to a week)</li>
              <li>🛡️ Improved security and faster login</li>
              <li>⚡ Smarter attendance marking</li>
              <li>📊 Enhanced performance tracking</li>
            </ul>
            <button className="tl-submit" onClick={handleCloseVersionModal}>
              Continue to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherLogin;