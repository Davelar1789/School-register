import React from "react";
import "./Header.modules.css"; // Using direct import as per your instruction
import logo from "../assets/images/logo.png"; // Ensure you have a logo in the assets folder

const Header = () => {
  return (
    <header className="header">
      {/* Logo */}
      <div className="logoContainer">
        <span className="logoText">Codewhiz Schools</span>
      </div>


      {/* Navigation Menu */}
      <nav className="nav">
        <ul className="navList">
          <li className="navItem"><a href="" className="navLink">Home</a></li>
          <li className="navItem"><a href="#features" className="navLink">Features</a></li>
          <li className="navItem"><a href="#solutions" className="navLink">About Us</a></li>
          <li className="navItem"><a href="#contact" className="navLink">Contact</a></li>
          <li className="navItem"><a href="/sign-in" className="navLink">Log In</a></li>
          <li className="navItem"><a href="/sign-up" className="navLink">Sign Up</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
