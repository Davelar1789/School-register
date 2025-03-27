import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import heroImage from '../../../assets/images/hero2.jpg'; // Import the image
import './HomePage.modules.css';

function Home() {
  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          position: 'relative',
          textAlign: 'center',
          marginTop: '56px',
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Joyful Brains Academy</h1>
          <p className="hero-subtitle">Unlocking Brilliance, One Mind at a Time</p>
          <Link to="/sign-in">
            <button className="cta-button">Enroll Now</button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Excellence in Education</h3>
            <p>Our highly skilled educators inspire students to achieve academic success.</p>
          </div>
          <div className="feature-card">
            <h3>State-of-the-Art Facilities</h3>
            <p>Modern classrooms and labs equipped to foster hands-on learning experiences.</p>
          </div>
          <div className="feature-card">
            <h3>Holistic Development</h3>
            <p>Encouraging creativity, teamwork, and leadership through diverse extracurricular activities.</p>
          </div>
        </div>
      </section>

      {/* Steps to Get Started */}
      <section className="steps-section">
        <h2 className="section-title">Your Journey with Us</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <h4>Explore Our Programs</h4>
            <p>Discover a range of academic and extracurricular opportunities designed to nurture your potential.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h4>Visit Our Campus</h4>
            <p>Experience the vibrant environment and state-of-the-art facilities at Joyful Brains Academy.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h4>Join Our Family</h4>
            <p>Enroll and become part of a community dedicated to learning, growth, and excellence.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Students Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"Joyful Brains Academy transformed my learning experience. The teachers truly care about every student!"</p>
            <h4>- Sarah M., Grade 10</h4>
          </div>
          <div className="testimonial-card">
            <p>"The opportunities for personal growth and leadership here are unparalleled. I'm so proud to be a student here."</p>
            <h4>- Daniel K., Grade 12</h4>
          </div>
          <div className="testimonial-card">
            <p>"From academics to extracurriculars, JBA offers the perfect balance for holistic development."</p>
            <h4>- Priya R., Grade 8</h4>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2 className="section-title">Contact Us</h2>
        <p>If you have any questions or need more information, feel free to reach out.</p>
        <div className="contact-info">
          <p>Email: info@joyfulbrainsacademy.com</p>
          <p>Phone: +233 (0) 55-249-8878</p>
          <p>Address: 123 Columba Street, Kasoa, Ghana</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
