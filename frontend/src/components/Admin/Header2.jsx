import React, { useState, useEffect, useRef } from "react";
import {
  FaBell, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher,
  FaCalendar, FaComments, FaHome, FaBars, FaTimes
} from "react-icons/fa";
import {
  Settings, Search, ChevronDown, GraduationCap,
  BookOpen, DollarSign, TrendingUp, Eye, LayoutGrid
} from "lucide-react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { jwtDecode } from "jwt-decode";
import Image1 from "../../assets/images/userrr.png";
import "./Header2.modules.css";

const NAV_ITEMS = [
  { to: "/dashboard",        label: "Dashboard",       icon: FaHome            },
  { to: "/termly-details",   label: "Termly Details",  icon: FaComments        },
  { to: "/fees",             label: "Fees",            icon: DollarSign        },
  { to: "/expenses",         label: "Accounts",        icon: FaCalendar        },
  { to: "/income",           label: "Income Statement",icon: TrendingUp        },
  { to: "/students-teachers",label: "Students/Teachers",icon: FaUserGraduate  },
  { to: "/view-attendance",  label: "Attendance",      icon: Eye               },
  { to: "/classes-main",     label: "Classes",         icon: FaChalkboardTeacher},
];

const Header = () => {
  const [windowWidth,    setWindowWidth]    = useState(window.innerWidth);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [user,           setUser]           = useState(null);
  const [school,         setSchool]         = useState(null);
  const [notifCount,     setNotifCount]     = useState(3); // replace with real API
  const [dropdownOpen,   setDropdownOpen]   = useState(false);

  const searchRef  = useRef(null);
  const dropRef    = useRef(null);
  const location   = useLocation();
  const navigate   = useNavigate();

  const isFeesActive = ["/fees", "/school-fees", "/feeding-fee"].includes(location.pathname);

  /* ── resize ── */
  useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 974) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── auth ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login first."); navigate("/teacher-login"); return; }
    const decoded = jwtDecode(token);
    setUser({ id: decoded.id, fullName: decoded.fullName, role: decoded.role, schoolName: decoded.schoolName });
    fetchSchool(decoded.id);
  }, [navigate]);

  const fetchSchool = async (userId) => {
    try {
      const cached = localStorage.getItem("schoolData");
      if (cached) { setSchool(JSON.parse(cached)); return; }
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/schools/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) {
        const sd = res.data.school || res.data;
        localStorage.setItem("schoolData", JSON.stringify(sd));
        setSchool(sd);
      }
    } catch (err) { console.error(err); }
  };

  /* ── click outside: close dropdown & search ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── lock body scroll when mobile sidebar open ── */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/api/users/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem("token");
      localStorage.removeItem("schoolData");
      toast.success("Logged out successfully");
      navigate("/teacher-login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed. Please try again.");
    }
  };

  /* ── initials helper ── */
  const initials = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const schoolInitial = school?.name ? school.name.charAt(0).toUpperCase() : "S";

  return (
    <>
      {/* ════════════════════════════════
          MAIN HEADER
      ════════════════════════════════ */}
      <header className="h2-header">

        {/* LEFT — hamburger + school brand */}
        <div className="h2-left">
          <button
            className="h2-hamburger"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FaTimes size={17} /> : <FaBars size={17} />}
          </button>

          <div className="h2-brand" onClick={() => navigate("/dashboard")}>
            <div className="h2-brand-logo">
              <GraduationCap size={18} />
            </div>
            <div className="h2-brand-text">
              <span className="h2-school-name">{school?.name || "School Dashboard"}</span>
              <span className="h2-school-sub">Management Portal</span>
            </div>
          </div>
        </div>

        {/* CENTER — search (desktop inline, mobile expands) */}
        <div className={`h2-search-wrap ${searchOpen ? "open" : ""}`} ref={searchRef}>
          {windowWidth > 768 || searchOpen ? (
            <div className="h2-search-box">
              <Search size={14} className="h2-search-ico" />
              <input
                className="h2-search-input"
                placeholder="Search students, teachers, classes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus={searchOpen}
              />
              {searchQuery && (
                <button className="h2-search-clear" onClick={() => setSearchQuery("")}>
                  <FaTimes size={11} />
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* RIGHT — actions + user */}
        <div className="h2-right">

          {/* search toggle — mobile only */}
          {windowWidth <= 768 && (
            <button className="h2-icon-btn" onClick={() => setSearchOpen(p => !p)} aria-label="Search">
              <Search size={17} />
            </button>
          )}

          {/* notifications */}
          <button
            className="h2-icon-btn h2-notif-btn"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
          >
            <FaBell size={16} />
            {notifCount > 0 && (
              <span className="h2-notif-badge">{notifCount > 9 ? "9+" : notifCount}</span>
            )}
          </button>

          {/* settings — hide on very small screens */}
          {windowWidth > 480 && (
            <button
              className="h2-icon-btn"
              onClick={() => navigate("/school-settings")}
              aria-label="Settings"
            >
              <Settings size={17} />
            </button>
          )}

          {/* user dropdown */}
          <div className="h2-user-wrap" ref={dropRef}>
            <button className="h2-user-btn" onClick={() => setDropdownOpen(p => !p)}>
              <div className="h2-avatar">
                {user?.fullName ? initials(user.fullName) : "U"}
              </div>
              {windowWidth > 600 && (
                <div className="h2-user-info">
                  <span className="h2-user-name">{user?.fullName || "User"}</span>
                  <span className="h2-user-role">{user?.role || "Admin"}</span>
                </div>
              )}
              {windowWidth > 600 && (
                <ChevronDown
                  size={14}
                  className={`h2-chevron ${dropdownOpen ? "rotated" : ""}`}
                />
              )}
            </button>

            {dropdownOpen && (
              <div className="h2-dropdown">
                <div className="h2-dropdown-header">
                  <div className="h2-drop-avatar">{user?.fullName ? initials(user.fullName) : "U"}</div>
                  <div>
                    <p className="h2-drop-name">{user?.fullName}</p>
                    <p className="h2-drop-role">{user?.role}</p>
                  </div>
                </div>
                <div className="h2-dropdown-divider" />
                <button
                  className="h2-dropdown-item"
                  onClick={() => { navigate("/school-settings"); setDropdownOpen(false); }}
                >
                  <Settings size={14} /> Settings
                </button>
                <div className="h2-dropdown-divider" />
                <button className="h2-dropdown-item danger" onClick={handleLogout}>
                  <FaSignOutAlt size={13} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════
          MOBILE SIDEBAR OVERLAY
      ════════════════════════════════ */}
      {sidebarOpen && windowWidth <= 974 && (
        <div className="h2-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="h2-mobile-sidebar" onClick={e => e.stopPropagation()}>

            {/* sidebar top */}
            <div className="h2-sidebar-top">
              <div className="h2-sidebar-brand">
                <div className="h2-sidebar-logo">{schoolInitial}</div>
                <div>
                  <p className="h2-sidebar-school">{school?.name || "School Dashboard"}</p>
                  <p className="h2-sidebar-portal">Management Portal</p>
                </div>
              </div>
              <button className="h2-sidebar-close" onClick={() => setSidebarOpen(false)}>
                <FaTimes size={16} />
              </button>
            </div>

            {/* profile strip */}
            <div className="h2-sidebar-profile">
              <img src={Image1} alt={user?.fullName} className="h2-sidebar-pic" />
              <div>
                <p className="h2-sidebar-name">{user?.fullName}</p>
                <p className="h2-sidebar-role">{user?.role}</p>
              </div>
            </div>

            {/* nav */}
            <nav className="h2-sidebar-nav">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `h2-sidebar-link ${isActive || (to === "/fees" && isFeesActive) ? "active" : ""}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="h2-sidebar-link-icon"><Icon size={15} /></span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* logout */}
            <div className="h2-sidebar-footer">
              <button className="h2-sidebar-logout" onClick={handleLogout}>
                <FaSignOutAlt size={14} /> Logout
              </button>
            </div>

          </aside>
        </div>
      )}
    </>
  );
};

export default Header;