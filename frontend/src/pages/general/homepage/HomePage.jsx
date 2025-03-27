import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserGraduate, FaClipboardList, FaChartLine, FaComments, FaSchool, FaUniversity, FaBookReader, FaStar } from "react-icons/fa";
import Header from "../../../components/Header.jsx";
import Footer from "../../../components/Footer.jsx";
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

       {/* Solutions Section */}
       <section className="solutions">
        <h2 className="solutions-title">Tailored Solutions for Every Educational Level</h2>
        <div className="solutions-grid">
          {/* Primary Schools */}
          <Link to="/solutions/primary" className="solution-card primary">
            <FaSchool className="solution-icon" />
            <h3>Primary Schools</h3>
            <p>Structured for foundational learning institutions to enhance engagement and management.</p>
          </Link>

          {/* High Schools */}
          <Link to="/solutions/highschool" className="solution-card highschool">
            <FaUniversity className="solution-icon" />
            <h3>High Schools</h3>
            <p>Optimized for student performance tracking, attendance monitoring, and administrative efficiency.</p>
          </Link>

          {/* Colleges */}
          <Link to="/solutions/college" className="solution-card college">
            <FaBookReader className="solution-icon" />
            <h3>Colleges & Universities</h3>
            <p>Comprehensive tools for academic planning, resource management, and student engagement.</p>
          </Link>
        </div>
      </section>
      <section className="testimonials">
      <h2 className="testimonials-title">What Our Clients Say</h2>
      <div className="testimonial-card">
        <img src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} className="testimonial-img" />
        <p className="testimonial-feedback">"{testimonials[currentIndex].feedback}"</p>
        <div className="testimonial-rating">
          {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
            <FaStar key={i} className="star-icon" />
          ))}
        </div>
        <h3 className="testimonial-name">{testimonials[currentIndex].name}</h3>
        <p className="testimonial-role">{testimonials[currentIndex].role}</p>
      </div>
    </section>

      <Footer />
    </div>
  );
}

export default Home;
