import React from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header.jsx";
import Footer from "../../../components/Footer.jsx";
import "./HomePage.modules.css";

function Home() {
  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        {/* Background Image Slider */}
        <div className="hero-slider">
          <div className="hero-slide"></div> {/* The slides will be handled in CSS */}
          <div className="hero-overlay"></div> {/* Gradient overlay for depth */}
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            Revolutionize Your School's Management with Cutting-Edge Technology
          </h1>
          <p className="hero-subtitle">
            Empowering institutions with seamless administration, student tracking, and innovative learning tools.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <Link to="/demo" className="cta-button demo-btn">Schedule a Demo</Link>
            <Link to="/features" className="cta-button explore-btn">Explore Features</Link>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="features">
        <h2 className="features-title">Powerful Features to Elevate Your Institution</h2>
        <div className="features-grid">
          {/* Feature 1: Student Management */}
          <div className="feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>Student Information Management</h3>
            <p>Easily track student details, academic progress, and records in a centralized system.</p>
          </div>

          {/* Feature 2: Attendance Tracking */}
          <div className="feature-card">
            <FaClipboardList className="feature-icon" />
            <h3>Attendance Tracking</h3>
            <p>Automate attendance records with real-time updates and detailed reports.</p>
          </div>

          {/* Feature 3: Gradebook */}
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Gradebook & Performance Analytics</h3>
            <p>Monitor student performance with an intuitive grading system and analytics.</p>
          </div>

          {/* Feature 4: Communication Portal */}
          <div className="feature-card">
            <FaComments className="feature-icon" />
            <h3>Communication Portals</h3>
            <p>Enhance collaboration with direct messaging, announcements, and parent-teacher interactions.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
