import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Header.modules.css"; // Ensure you have this CSS file
import logo from "../assets/images/logo.png"; // Ensure you have a logo in the assets folder

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if token exists and is valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logoContainer">
        <span className="logoText">Codewhiz Schools</span>
      </div>

      {/* Desktop Navigation */}
      <nav className="nav">
        <ul className="navList">
          <li className="navItem"><a href="/" className="navLink">Home</a></li>
          <li className="navItem"><a href="#features" className="navLink">Features</a></li>
          <li className="navItem"><a href="#solutions" className="navLink">About Us</a></li>
          <li className="navItem"><a href="#contact" className="navLink">Contact</a></li>
          {isLoggedIn ? (
            <li className="navItem"><a href="/dashboard" className="navLink">Go to Dashboard</a></li>
          ) : (
            <>
              <li className="navItem"><a href="/sign-in" className="navLink">Log In</a></li>
              <li className="navItem"><a href="/sign-up" className="navLink">Sign Up</a></li>
            </>
          )}
        </ul>
      </nav>

      {/* Mobile Menu Icon */}
      <button className="menuIcon" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobileMenu">
          <ul className="mobileNavList">
            <li className="navItem"><a href="/" className="navLink">Home</a></li>
            <li className="navItem"><a href="#features" className="navLink">Features</a></li>
            <li className="navItem"><a href="#solutions" className="navLink">About Us</a></li>
            <li className="navItem"><a href="#contact" className="navLink">Contact</a></li>
            {isLoggedIn ? (
              <li className="navItem"><a href="/dashboard" className="navLink">Go to Dashboard</a></li>
            ) : (
              <>
                <li className="navItem"><a href="/sign-in" className="navLink">Log In</a></li>
                <li className="navItem"><a href="/sign-up" className="navLink">Sign Up</a></li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
