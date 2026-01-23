import React, { useState, useEffect } from "react";
import { 
  FaHome, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCalendar, 
  FaSignOutAlt,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
// import "../../pages/head/students/Students.modules.css";
import "./Sidebar.modules.css";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image1 from "../../assets/images/userrr.png";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });
  const [expandedSections, setExpandedSections] = useState({
    finances: false,
    people: false
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Check if any route in a group is active
  const isGroupActive = (routes) => {
    return routes.some(route => location.pathname.startsWith(route));
  };

  const fetchSchool = async (userId) => {
    try {
      const cachedSchoolData = localStorage.getItem('schoolData');
      if (cachedSchoolData) {
        const schoolData = JSON.parse(cachedSchoolData);
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");
      
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        const schoolData = response.data.school || response.data;
        localStorage.setItem('schoolData', JSON.stringify(schoolData));
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first.");
      navigate("/sign-in");
      return;
    }

    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      fullName: decoded.fullName,
      role: decoded.role,
      schoolName: decoded.schoolName,
    });

    fetchSchool(decoded.id);

    // Auto-expand sections based on current route
    if (isGroupActive(['/fees', '/school-fees', '/feeding-fee', '/expenses', '/income'])) {
      setExpandedSections(prev => ({ ...prev, finances: true }));
    }
    if (isGroupActive(['/students-teachers', '/view-attendance', '/classes-main'])) {
      setExpandedSections(prev => ({ ...prev, people: true }));
    }

    const handleSchoolUpdate = () => {
      const cachedSchoolData = localStorage.getItem("schoolData");
      if (cachedSchoolData) {
        const schoolData = JSON.parse(cachedSchoolData);
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    };

    window.addEventListener("schoolDataUpdated", handleSchoolUpdate);

    return () => {
      window.removeEventListener("schoolDataUpdated", handleSchoolUpdate);
    };
  }, [navigate, location.pathname]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!user) return null;

  return (
    <div className="sidebar">
      {/* School Header */}
      <div className="sidebar-header">
        <div className="logo">{school?.name ? school.name.charAt(0) : "S"}</div>
        <div className="school-info">
          <div className="school-name">{school?.name || "School Dashboard"}</div>
          <div className="school-stats-mini">
            <span title="Students">{schoolStats.numberOfStudents}👨‍🎓</span>
            <span title="Teachers">{schoolStats.numberOfTeachers}👨‍🏫</span>
            <span title="Classes">{schoolStats.numberOfClasses}🏫</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="sidebar-profile">
        <img src={Image1} alt="User" className="profile-pic" />
        <div className="profile-info">
          <h4>{user.fullName}</h4>
          <p className="user-role">{user.role}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {/* Dashboard - Always visible */}
        <div className="nav-section">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FaHome className="icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/termly-details" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FaCalendar className="icon" />
            <span>Term Details</span>
          </NavLink>
        </div>

        {/* Financial Management */}
        <div className="nav-section">
          <div 
            className={`section-header ${isGroupActive(['/fees', '/school-fees', '/feeding-fee', '/expenses', '/income']) ? 'active-group' : ''}`}
            onClick={() => toggleSection('finances')}
          >
            <div className="section-title">
              <FaMoneyBillWave className="section-icon" />
              <span>Financial Management</span>
            </div>
            {expandedSections.finances ? <FaChevronDown className="chevron" /> : <FaChevronRight className="chevron" />}
          </div>

          {expandedSections.finances && (
            <div className="submenu">
              <NavLink 
                to="/fees" 
                className={({ isActive }) => isActive || ['/school-fees', '/feeding-fee'].includes(location.pathname) ? "nav-link active" : "nav-link"}
              >
                <FaFileInvoiceDollar className="icon" />
                <span>Fee Management</span>
              </NavLink>

              <NavLink to="/expenses" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FaClipboardList className="icon" />
                <span>Expenses</span>
              </NavLink>

              <NavLink to="/income" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FaChartLine className="icon" />
                <span>Income Statement</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Academic & People */}
        <div className="nav-section">
          <div 
            className={`section-header ${isGroupActive(['/students-teachers', '/view-attendance', '/classes-main']) ? 'active-group' : ''}`}
            onClick={() => toggleSection('people')}
          >
            <div className="section-title">
              <FaUsers className="section-icon" />
              <span>Academic & People</span>
            </div>
            {expandedSections.people ? <FaChevronDown className="chevron" /> : <FaChevronRight className="chevron" />}
          </div>

          {expandedSections.people && (
            <div className="submenu">
              <NavLink to="/students-teachers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FaUserGraduate className="icon" />
                <span>Students & Teachers</span>
              </NavLink>

              <NavLink to="/view-attendance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FaClipboardList className="icon" />
                <span>Attendance</span>
              </NavLink>

              <NavLink to="/classes-main" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <FaChalkboardTeacher className="icon" />
                <span>Classes</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="nav-section logout-section">
          <div className="nav-link logout-link" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            <span>Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;