import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Header.modules.css";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Invalid token:", error);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDashboardClick = () => {
    if (userRole === "admin") {
      navigate("/dashboard");
    } else if (userRole === "Teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/");
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Logo */}
        <div className="logo-container">
          <a href="/" className="logo">
            <div className="logo-content">
              <span className="logo-text">De-ƒem</span>
              <span className="logo-subtext">Services</span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/" className="nav-link">Home</a>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link">Features</a>
            </li>
            <li className="nav-item">
              <a href="#solutions" className="nav-link">Solutions</a>
            </li>
            <li className="nav-item">
              <a href="#contact" className="nav-link">Contact</a>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          {isLoggedIn ? (
            <button onClick={handleDashboardClick} className="btn btn-dashboard">
              <FaUserCircle className="btn-icon" />
              Dashboard
            </button>
          ) : (
            <>
              <div className="login-dropdown">
                <button className="btn btn-login">
                  Log In
                  <FaChevronDown className="dropdown-icon" />
                </button>
                <div className="dropdown-menu">
                  <a href="/sign-in" className="dropdown-item">
                    <span>Admin Login</span>
                  </a>
                  <a href="/teacher-login" className="dropdown-item">
                    <span>Teacher Login</span>
                  </a>
                </div>
              </div>
              <a href="/sign-up" className="btn btn-primary">Get Started</a>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <a href="/" className="mobile-nav-link" onClick={closeMenu}>Home</a>
            </li>
            <li className="mobile-nav-item">
              <a href="#features" className="mobile-nav-link" onClick={closeMenu}>Features</a>
            </li>
            <li className="mobile-nav-item">
              <a href="#solutions" className="mobile-nav-link" onClick={closeMenu}>Solutions</a>
            </li>
            <li className="mobile-nav-item">
              <a href="#contact" className="mobile-nav-link" onClick={closeMenu}>Contact</a>
            </li>
            
            <li className="mobile-nav-divider"></li>
            
            {isLoggedIn ? (
              <li className="mobile-nav-item">
                <button onClick={handleDashboardClick} className="mobile-nav-link mobile-btn">
                  <FaUserCircle className="btn-icon" />
                  Go to Dashboard
                </button>
              </li>
            ) : (
              <>
                <li className="mobile-nav-item">
                  <a href="/sign-in" className="mobile-nav-link" onClick={closeMenu}>Admin Login</a>
                </li>
                <li className="mobile-nav-item">
                  <a href="/teacher-login" className="mobile-nav-link" onClick={closeMenu}>Teacher Login</a>
                </li>
                <li className="mobile-nav-item">
                  <a href="/sign-up" className="btn btn-primary mobile-cta" onClick={closeMenu}>
                    Get Started
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;