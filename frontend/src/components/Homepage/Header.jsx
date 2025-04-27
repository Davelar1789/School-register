import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Header.modules.css";
import logo from "../../assets/images/logo.png";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleDashboardClick = () => {
    if (userRole === "admin") {
      navigate("/dashboard");
    } else if (userRole === "Teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/"); // fallback if no valid role
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="head56">
      <div className="logoContainer">
        <span className="logoText">De-ƒem Services</span>
      </div>

      <nav className="nav">
        <ul className="navList">
          <li className="navItem"><a href="/" className="navLink">Home</a></li>
          <li className="navItem"><a href="#features" className="navLink">Features</a></li>
          <li className="navItem"><a href="#solutions" className="navLink">About Us</a></li>
          <li className="navItem"><a href="#contact" className="navLink">Contact</a></li>
          {isLoggedIn ? (
            <li className="navItem">
              <button onClick={handleDashboardClick} className="navLink" style={{ background: "none", border: "none", cursor: "pointer" }}>
                Go to Dashboard
              </button>
            </li>
          ) : (
            <>
              <li className="navItem login-dropdown">
                <span className="navLink">Log In</span>
                <div className="dropdown-menu">
                  <ul>
                    <li><a href="/sign-in">As Admin</a></li>
                    <li><a href="/teacher-login">As Teacher</a></li>
                    <li><a href="/student-login">As Student</a></li>
                  </ul>
                </div>
              </li>
              {/* <li className="navItem"><a href="/sign-up" className="navLink">Sign Up</a></li> */}
            </>
          )}
        </ul>
      </nav>

      <button className="menuIcon" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isMenuOpen && (
        <div className="mobileMenu">
          <ul className="mobileNavList">
            <li className="navItem"><a href="/" className="navLink">Home</a></li>
            <li className="navItem"><a href="#features" className="navLink">Features</a></li>
            <li className="navItem"><a href="#solutions" className="navLink">About Us</a></li>
            <li className="navItem"><a href="#contact" className="navLink">Contact</a></li>
            {isLoggedIn ? (
              <li className="navItem">
                <button onClick={handleDashboardClick} className="navLink" style={{ background: "none", border: "none", cursor: "pointer" }}>
                  Go to Dashboard
                </button>
              </li>
            ) : (
              <>
                <li className="navItem"><a href="/sign-in" className="navLink">Log In</a></li>
                {/* <li className="navItem"><a href="/sign-up" className="navLink">Sign Up</a></li> */}
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
