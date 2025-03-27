import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi"; // Importing close icon
import "./Header2.modules.css";
import "./Sidebar.modules.css";
import notificationIcon from "../assets/images/notification.png";
import downArrow2 from "../assets/images/dropdown4.png";
import manageAccountIcon from "../assets/images/manage-account.png";
import changePasswordIcon from "../assets/images/change-password.png";
import logoutIcon from "../assets/images/logout.png";
import dashboardIcon from "../assets/images/dashboard-icon.png";
import productStockIcon from "../assets/images/product-stock-icon.png";
import teamIcon from "../assets/images/team-icon.png";
import orderListsIcon from "../assets/images/order-lists-icon.png";
import calendarIcon from "../assets/images/calendar-icon.png";
import contactIcon from "../assets/images/contact-icon.png";
import invoiceIcon from "../assets/images/invoice-icon.png";
import settingsIcon from "../assets/images/settings-icon.png";
import axios from "axios";
import toast from "react-hot-toast";
import { useUserContext } from "../context/userContext";

const TeacherHeader = () => {
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const { currentUser } = useUserContext();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleLogout = async () => {
    axios
      .get("/api/auth/logout", { withCredentials: true })
      .then(() => {
        toast.success("Logged Out");
        navigate("/");
        navigate(0);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const changePassword = () => {
    navigate("/teacher/change-password");
  };

  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setProfileDropdownOpen(false);
    }

    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: dashboardIcon, path: "" },
        {
          name: "My Students",
          icon: productStockIcon,
          path: "manage-students",
        },
        { name: "Edit Grades", icon: dashboardIcon, path: "edit-grades" },
        { name: "Grade Book", icon: dashboardIcon, path: "grade-book" },
        { name: "Attendance", icon: dashboardIcon, path: "attendance" },
  ];

  const handleNavigation = (path) => {
    if (path === "teacher/logout") {
      handleLogout();
    } else {
      navigate(`/${path}`);
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <header className="header2 w-full overflow-hidden flex justify-between items-center p-4">
        {/* Menu Icon */}
        <HiMenu
          className="text-3xl cursor-pointer text-gray-700 hover:text-gray-900 transition-all sm:ml-2"
          onClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-row items-center gap-4">
          <img src={notificationIcon} alt="Notification" className="icon2" />

          <div className="flex flex-row items-center gap-3">
            <img
              src={currentUser?.profilePicture}
              alt="Profile"
              className="w-[35px] h-[35px] rounded-full "
            />
            <div className="md:profile-info md:flex md:flex-col hidden">
              <span className="profile-name">{currentUser?.username}</span>
              <span className="profile-role">{currentUser?.role}</span>
            </div>
            <img
              src={downArrow2}
              alt="Down Arrow"
              className="icon2 down-arrow profile-arrow"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            />
            {profileDropdownOpen && (
              <div className="profile-dropdown" ref={profileDropdownRef}>
                <div className="profile-option">
                  <img src={manageAccountIcon} alt="Manage Account" className="icon2" />
                  <span className="profile-option-text">Manage Account</span>
                </div>
                <div className="profile-option" onClick={changePassword}>
                  <img src={changePasswordIcon} alt="Change Password" className="icon2" />
                  <span className="profile-option-text">Change Password</span>
                </div>
                <div className="profile-option" onClick={handleLogout}>
                  <img src={logoutIcon} alt="Log out" className="icon2" />
                  <span className="profile-option-text">Log out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} ref={sidebarRef}>
        {/* Close Icon */}
        <HiX className="close-icon" onClick={() => setSidebarOpen(false)} />

        <div className="sidebar-content">
          {menuItems.map((item, index) => (
            <div key={index} onClick={() => handleNavigation(`teacher/${item.path}`)}>
              <div
                className={`menu-item ${location === `/teacher/${item.path}` ? "selected" : ""}`}
              >
                <img src={item.icon} alt={item.name} />
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default TeacherHeader;
