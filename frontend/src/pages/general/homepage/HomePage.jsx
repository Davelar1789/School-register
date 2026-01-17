import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserGraduate, FaClipboardList, FaChartLine, FaComments, FaSchool, FaUniversity, FaBookReader, FaStar, FaCheck } from "react-icons/fa";
import Header from "../../../components/Homepage/Header.jsx";
import Footer from "../../../components/Homepage/Footer.jsx";
import Image1 from "../../../assets/images/head1.jpg";
import Image2 from "../../../assets/images/head2.jpg";
import Image3 from "../../../assets/images/head3.jpg";
import "./HomePage.modules.css";

const testimonials = [
  {
    name: "Principal Smith",
    role: "Principal, Greenfield Academy",
    image: "../../../assets/images/head2.jpg",
    rating: 5,
    feedback: "This system has completely transformed how we manage our school. It's intuitive and highly efficient!"
  },
  {
    name: "Karen Thompson",
    role: "Head of Admissions, Bright Future High",
    image: "../../../assets/images/head1.jpg",
    rating: 4,
    feedback: "A fantastic tool! Our administrative processes have never been smoother. Highly recommended."
  },
  {
    name: "Michael Davis",
    role: "Director, Elite College",
    image: "../../../assets/images/head3.jpg",
    rating: 5,
    feedback: "An all-in-one solution that has streamlined our student tracking and communications perfectly!"
  }
];

const stats = [
  { number: "500+", label: "Schools Trust Us" },
  { number: "50K+", label: "Active Students" },
  { number: "98%", label: "Satisfaction Rate" },
  { number: "24/7", label: "Support Available" }
];

const benefits = [
  "Reduce administrative workload by 60%",
  "Real-time data access and insights",
  "Secure cloud-based storage",
  "Mobile-friendly interface",
  "Automated reporting and analytics",
  "Seamless integration capabilities"
];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-slider">
          <div className="hero-slide"></div>
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">Trusted by 500+ Educational Institutions</div>
          <h1 className="hero-title">
            Transform Your Educational Institution with Modern Management Solutions
          </h1>
          <p className="hero-subtitle">
            Streamline operations, enhance student outcomes, and empower your team with our comprehensive school management platform.
          </p>

          <div className="hero-buttons">
            <Link to="/demo" className="cta-button primary-btn">
              Get Started Free
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/features" className="cta-button secondary-btn">
              Watch Demo
            </Link>
          </div>

          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-content">
            <h2 className="section-title">Why Choose Our Platform?</h2>
            <p className="section-subtitle">
              Experience the difference with tools designed specifically for modern educational excellence.
            </p>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <FaCheck className="check-icon" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2 className="section-title">Powerful Features Built for Education</h2>
          <p className="section-subtitle">
            Everything you need to manage your institution efficiently in one integrated platform.
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaUserGraduate className="feature-icon" />
            </div>
            <h3>Student Information System</h3>
            <p>Centralized student data management with comprehensive profiles, academic history, and real-time tracking capabilities.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaClipboardList className="feature-icon" />
            </div>
            <h3>Smart Attendance</h3>
            <p>Automated attendance tracking with instant notifications, detailed analytics, and seamless parent communication.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaChartLine className="feature-icon" />
            </div>
            <h3>Advanced Analytics</h3>
            <p>Data-driven insights with customizable dashboards, performance metrics, and predictive analytics for student success.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaComments className="feature-icon" />
            </div>
            <h3>Unified Communication</h3>
            <p>Streamlined messaging platform connecting teachers, students, and parents with announcements and real-time updates.</p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="solutions">
        <div className="section-header">
          <h2 className="section-title">Tailored for Every Educational Level</h2>
          <p className="section-subtitle">
            Specialized solutions designed to meet the unique needs of your institution.
          </p>
        </div>
        
        <div className="solutions-grid">
          <Link to="/solutions/primary" className="solution-card">
            <div className="solution-icon-wrapper primary-bg">
              <FaSchool className="solution-icon" />
            </div>
            <h3>Primary Schools</h3>
            <p>Nurture young learners with tools designed for foundational education, parent engagement, and early development tracking.</p>
            <span className="solution-link">Learn More →</span>
          </Link>

          <Link to="/solutions/highschool" className="solution-card">
            <div className="solution-icon-wrapper secondary-bg">
              <FaUniversity className="solution-icon" />
            </div>
            <h3>High Schools</h3>
            <p>Comprehensive systems for academic excellence, college preparation, extracurricular management, and student development.</p>
            <span className="solution-link">Learn More →</span>
          </Link>

          <Link to="/solutions/college" className="solution-card">
            <div className="solution-icon-wrapper accent-bg">
              <FaBookReader className="solution-icon" />
            </div>
            <h3>Higher Education</h3>
            <p>Advanced features for universities including course management, research tracking, and comprehensive student services.</p>
            <span className="solution-link">Learn More →</span>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <h2 className="section-title">Trusted by Education Leaders</h2>
          <p className="section-subtitle">
            Hear from institutions that have transformed their operations with our platform.
          </p>
        </div>
        
        <div className="testimonial-container">
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-feedback">{testimonials[currentIndex].feedback}</p>
            <div className="testimonial-rating">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <FaStar key={i} className="star-icon" />
              ))}
            </div>
            <div className="testimonial-author">
              <img src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} className="testimonial-img" />
              <div className="testimonial-info">
                <h3 className="testimonial-name">{testimonials[currentIndex].name}</h3>
                <p className="testimonial-role">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Institution?</h2>
          <p className="cta-subtitle">Join hundreds of schools already experiencing the difference.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary-btn large">
              Start Your Free Trial
            </Link>
            <Link to="/contact" className="cta-button outline-btn large">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;