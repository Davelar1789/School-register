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

      <Footer />
    </div>
  );
}

export default Home;
