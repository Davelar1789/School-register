import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.modules.css";
import logo from "../assets/images/logo.png";
import cart from "../assets/images/cart.png";
import user from "../assets/images/white.png";
import searchIcon from "../assets/images/search.png";
import { useUserContext } from "../context/userContext";
import axios from "../api/axios"; // Importing the centralized API configuration
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";


const Header = () => {
  const { currentUser } = useUserContext();

  const [showLoginBox, setShowLoginBox] = useState(false);
  const navigate = useNavigate();

  const toggleLoginBox = () => {
    setShowLoginBox(!showLoginBox);
  };

  const closeLoginBox = () => {
    setShowLoginBox(false);
  };

  const handleLogout = async () => {
    try {
      // Use `api` instance for logout request
      await axios.delete("/api/auth/logout", { withCredentials: true });
      toast.success("Logged Out");
      navigate(0); // Refresh the page
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Something went wrong");
    }
  };

  const cartOpen = () => {
    navigate("/cart");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".header-right") && showLoginBox) {
        closeLoginBox();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showLoginBox]);

  return (
    <header className="header">
      <div className="header-left cursor-pointer" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="header-center">
      <nav>
  <ul className="nav-links">
    <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
    <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About Us</NavLink></li>
    <li><NavLink to="/admission" className={({ isActive }) => isActive ? 'active' : ''}>Admissions</NavLink></li>
    <li><NavLink to="/programs" className={({ isActive }) => isActive ? 'active' : ''}>Programs</NavLink></li>
    <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink></li>
  </ul>
</nav>
      </div>
      <div className="header-right">
        {currentUser ? (
          <img
            onClick={toggleLoginBox}
            className="icon normal-icon rounded-full"
            src={currentUser.profilePicture || user}
            alt="Profile"
          />
        ) : (
          <img
            src={user}
            alt="User"
            className="icon normal-icon"
            onClick={toggleLoginBox}
          />
        )}
        {showLoginBox && (
          <div className="login-box">
            {currentUser ? (
              <>
                {currentUser.role === "admin" && (
                  <button
                    className="signup-button"
                    onClick={() => navigate("/admin")}
                  >
                    Admin Dashboard
                  </button>
                )}
                {currentUser.role === "teacher" && (
                  <button
                    className="signup-button"
                    onClick={() => navigate("/teacher")}
                  >
                    Teacher Dashboard
                  </button>
                )}
                <button className="signup-button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <a href="/sign-in">
                  <button className="login-button">Log In</button>
                </a>
                <a href="/sign-up">
                  <button className="signup-button">Sign Up</button>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
