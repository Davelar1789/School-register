import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUserGraduate, FaClipboardList, FaChartLine, FaComments,
  FaSchool, FaUniversity, FaBookReader, FaStar, FaCheck,
  FaRocket, FaBell, FaShieldAlt, FaMobileAlt
} from "react-icons/fa";
import Header from "../../../components/Homepage/Header.jsx";
import Footer from "../../../components/Homepage/Footer.jsx";
import "./HomePage.modules.css";

const testimonials = [
  {
    name: "Principal Asante",
    role: "Principal, Greenfield Academy",
    initials: "PA",
    color: "teal",
    rating: 5,
    feedback: "This system has completely transformed how we manage our school. It's intuitive, fast, and the kids love the interface!"
  },
  {
    name: "Karen Thompson",
    role: "Head of Admissions, Bright Future High",
    initials: "KT",
    color: "amber",
    rating: 4,
    feedback: "A fantastic tool! Our administrative processes have never been smoother. Parents are always in the loop now."
  },
  {
    name: "Michael Davis",
    role: "Director, Elite College",
    initials: "MD",
    color: "coral",
    rating: 5,
    feedback: "An all-in-one solution that has streamlined our student tracking and communications perfectly!"
  }
];

const stats = [
  { number: "500+", label: "Schools Trust Us", emoji: "🏫" },
  { number: "50K+", label: "Active Students", emoji: "🎓" },
  { number: "98%", label: "Satisfaction Rate", emoji: "⭐" },
  { number: "24/7", label: "Support Available", emoji: "🛡️" }
];

const benefits = [
  "Reduce administrative workload by 60%",
  "Real-time data access and insights",
  "Secure cloud-based storage",
  "Mobile-friendly interface",
  "Automated reporting and analytics",
  "Seamless integration capabilities"
];

const floatingShapes = [
  { shape: "✏️", top: "12%", left: "5%", delay: "0s", size: "2rem" },
  { shape: "📚", top: "20%", right: "6%", delay: "0.4s", size: "2.2rem" },
  { shape: "🔬", top: "62%", left: "3%", delay: "0.8s", size: "1.8rem" },
  { shape: "🎨", top: "70%", right: "4%", delay: "0.3s", size: "2rem" },
  { shape: "🧮", top: "38%", left: "2%", delay: "1.1s", size: "1.7rem" },
  { shape: "🌍", top: "45%", right: "3%", delay: "0.6s", size: "2rem" },
];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <Header />

      {/* ── Hero Section ── */}
      <section className="hero">
        {/* Decorative background blobs */}
        <div className="hero-blob blob-1" />
        <div className="hero-blob blob-2" />
        <div className="hero-blob blob-3" />

        {/* Floating emoji decorations */}
        {floatingShapes.map((s, i) => (
          <span
            key={i}
            className="floating-shape"
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              animationDelay: s.delay,
              fontSize: s.size,
            }}
          >
            {s.shape}
          </span>
        ))}

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Trusted by 500+ Educational Institutions
          </div>

          <h1 className="hero-title">
            Learning is{" "}
            <span className="hero-title-highlight">Brighter</span>{" "}
            with De-ƒem
          </h1>

          <p className="hero-subtitle">
            A joyful, powerful platform that keeps students, teachers, and parents
            connected — from attendance to report cards, all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/sign-up" className="cta-button primary-btn">
              Get Started Free <span className="btn-arrow">→</span>
            </Link>
            <Link to="/sign-in" className="cta-button secondary-btn">
              Admin Login
            </Link>
          </div>

          {/* Fun illustrated card row */}
          <div className="hero-cards-row">
            <div className="hero-mini-card teal-card">
              <span className="mini-card-label">Attendance</span>
            </div>
            <div className="hero-mini-card amber-card">
              <span className="mini-card-label">Results</span>
            </div>
            <div className="hero-mini-card coral-card">
              <span className="mini-card-label">Messages</span>
            </div>
            <div className="hero-mini-card purple-card">
              <span className="mini-card-label">Progress</span>
            </div>
          </div>
        </div>

        {/* Stats ribbon */}
        <div className="hero-stats-ribbon">
          {stats.map((stat, i) => (
            <div key={i} className="stat-item">
              <span className="stat-emoji">{stat.emoji}</span>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="features">
        <div className="section-header">
          <p className="section-eyebrow">What We Offer</p>
          <h2 className="section-title">Everything Your School Needs</h2>
          <p className="section-subtitle">
            Powerful tools built so teachers can teach, and students can shine.
          </p>
        </div>

        <div className="features-grid">
          {[
            {
              icon: <FaUserGraduate />, color: "teal",
              title: "Student Information",
              desc: "Centralized student profiles with academic history, photos, and real-time tracking — all in one place."
            },
            {
              icon: <FaClipboardList />, color: "amber",
              title: "Smart Attendance",
              desc: "Mark and monitor attendance in seconds. Parents get instant alerts and never miss an update."
            },
            {
              icon: <FaChartLine />, color: "coral",
              title: "Advanced Analytics",
              desc: "Beautiful dashboards and performance reports that make data easy to understand and act on."
            },
            {
              icon: <FaComments />, color: "purple",
              title: "Unified Messaging",
              desc: "Connect teachers, students, and parents on one secure platform with announcements and direct chat."
            },
            {
              icon: <FaBell />, color: "green",
              title: "Smart Notifications",
              desc: "Never miss a beat — automated reminders for exams, fees, events, and more."
            },
            {
              icon: <FaShieldAlt />, color: "blue",
              title: "Secure & Reliable",
              desc: "Bank-grade security keeps every student record, payment, and message safe at all times."
            },
          ].map((f, i) => (
            <div key={i} className={`feature-card fc-${f.color}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`feature-icon-wrapper fiw-${f.color}`}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="benefits-section">
        <div className="benefits-inner">
          <div className="benefits-text">
            <p className="section-eyebrow">Why De-ƒem?</p>
            <h2 className="section-title">Built for Real Schools,<br />Real Students</h2>
            <p className="section-subtitle">
              From the smallest primary class to a large high school, our platform
              scales effortlessly and makes every day run smoother.
            </p>
            <div className="benefits-list">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <span className="benefit-check"><FaCheck /></span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <Link to="/sign-up" className="cta-button primary-btn">
              Get Started Free →
            </Link>
          </div>

          <div className="benefits-visual">
            <div className="bv-card bv-card-top">
              <span className="bv-icon">🎯</span>
              <div>
                <strong>Today's Attendance</strong>
                <p>Class 6B — 28 / 30 present</p>
              </div>
              <span className="bv-badge green-badge">✔ Marked</span>
            </div>
            <div className="bv-card bv-card-mid">
              <span className="bv-icon">📈</span>
              <div>
                <strong>Term Results Ready</strong>
                <p>132 report cards generated</p>
              </div>
              <span className="bv-badge amber-badge">New</span>
            </div>
            <div className="bv-card bv-card-bot">
              <span className="bv-icon">💬</span>
              <div>
                <strong>Parent Message</strong>
                <p>"Thanks for the quick update!"</p>
              </div>
              <span className="bv-badge teal-badge">Replied</span>
            </div>
            <div className="bv-deco-circle c1" />
            <div className="bv-deco-circle c2" />
          </div>
        </div>
      </section>

      {/* ── Solutions Section ── */}
      <section id="solutions" className="solutions">
        <div className="section-header">
          <p className="section-eyebrow">Solutions</p>
          <h2 className="section-title">Made for Every Level</h2>
          <p className="section-subtitle">
            Specially designed features for each stage of a student's journey.
          </p>
        </div>

        <div className="solutions-grid">
          <Link to="/solutions/primary" className="solution-card sc-teal">
            <div className="solution-emoji">🏫</div>
            <h3>Primary Schools</h3>
            <p>Fun, colourful tools for young learners — track development, engage parents, and make every milestone count.</p>
            <span className="solution-link">Learn More →</span>
          </Link>

          <Link to="/solutions/highschool" className="solution-card sc-amber">
            <div className="solution-emoji">📖</div>
            <h3>High Schools</h3>
            <p>Manage exams, timetables, clubs, and college prep all in one powerful dashboard built for secondary education.</p>
            <span className="solution-link">Learn More →</span>
          </Link>

          <Link to="/solutions/college" className="solution-card sc-coral">
            <div className="solution-emoji">🎓</div>
            <h3>Higher Education</h3>
            <p>Advanced course management, research tracking, and student services built for universities and colleges.</p>
            <span className="solution-link">Learn More →</span>
          </Link>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <p className="section-eyebrow">Testimonials</p>
          <h2 className="section-title">Loved by Education Leaders</h2>
          <p className="section-subtitle">
            Hear from schools that have transformed how they work.
          </p>
        </div>

        <div className="testimonial-container">
          <div className="testimonial-card">
            <div className="quote-mark">"</div>
            <p className="testimonial-feedback">{testimonials[currentIndex].feedback}</p>
            <div className="testimonial-rating">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <FaStar key={i} className="star-icon" />
              ))}
            </div>
            <div className="testimonial-author">
              <div className={`t-avatar avatar-${testimonials[currentIndex].color}`}>
                {testimonials[currentIndex].initials}
              </div>
              <div className="testimonial-info">
                <h3 className="testimonial-name">{testimonials[currentIndex].name}</h3>
                <p className="testimonial-role">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </div>

          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta-section">
        <div className="cta-blob cta-blob-1" />
        <div className="cta-blob cta-blob-2" />
        <div className="cta-content">
          <span className="cta-emoji">🚀</span>
          <h2 className="cta-title">Ready to Transform Your School?</h2>
          <p className="cta-subtitle">
            Join hundreds of schools already loving De-ƒem Services.
          </p>
          <div className="cta-buttons">
            <Link to="/sign-up" className="cta-button primary-btn large">
              Start for Free
            </Link>
            <Link to="/contact" className="cta-button outline-btn large">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;