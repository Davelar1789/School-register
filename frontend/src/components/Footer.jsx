import React from "react";
import "./Footer.modules.css"; // Importing the stylesheet as per your requirement
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaWhatsapp, FaLinkedin, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* Quick Links Section */}
        <div className="footerSection">
          <h3>Quick Links</h3>
          <ul className="footerLinks">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact Information Section */}
        <div className="footerSection">
          <h3>Contact Us</h3>
          <p><FaEnvelope className="icon" /> info@schoolms.com</p>
          <p><FaPhone className="icon" /> +233 123 456 789</p>
          <p><FaMapMarkerAlt className="icon" /> Accra, Ghana</p>
        </div>

        {/* Social Media Icons Section */}
        <div className="footerSection">
          <h3>Follow Us</h3>
          <div className="socialIcons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="socialIcon facebook"><FaFacebook /></a>
            <a href="https://wa.me/+233557625112?text=Hello" target="_blank" rel="noopener noreferrer" className="socialIcon twitter"><FaWhatsapp /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="socialIcon linkedin"><FaLinkedin /></a>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="footerSection newsletter">
          <h3>Subscribe to Our Newsletter</h3>
          <p>Get the latest updates and offers.</p>
          <div className="newsletterForm">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footerBottom">
        <p>&copy; 2025 Codewhiz Schools. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
