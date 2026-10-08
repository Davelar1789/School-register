import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Bell, ChevronDown, GraduationCap, LogOut, Menu, Search, Settings, WifiOff, X, CornerDownLeft,
} from "lucide-react";
import api from "../../api/axios";
import getSocket from "../../lib/socket";
import {
  clearSession, decodeToken, initials, loginPathFor, readJSON,
} from "../../utils/auth";
import { NAV, flatNav, isItemActive, titleFor } from "./navConfig";
import "./AppShell.css";

const ROLE_LABEL = { admin: "Administrator", superadmin: "Super Admin", Teacher: "Teacher", teacher: "Teacher" };

/**
 * Persistent layout for every authenticated area.
 *   <AppShell variant="admin" />  — rendered once as a router layout route,
 * pages render into <Outlet/> and no longer carry their own sidebar / header.
 */
export default function AppShell({ variant = "admin" }) {
  const nav = NAV[variant];
  const location = useLocation();
  const navigate = useNavigate();

  const decoded = useMemo(() => decodeToken(), []);
  const teacher = useMemo(() => readJSON("teacher", {}), []);
  const [school, setSchool] = useState(() => readJSON("schoolData", null));
  const [drawer, setDrawer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [unread, setUnread] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cursor, setCursor] = useState(0);

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const fullName = decoded?.fullName || teacher?.fullName || "User";
  const role = decoded?.role || variant;
  const schoolName = school?.name || decoded?.schoolName || "School Register";
  const teacherType = teacher?.teacherType || decoded?.teacherType || "";
  const userId = decoded?.id || teacher?.id || teacher?._id;

  /* ── connectivity ── */
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  /* ── close transient UI on navigation ── */
  useEffect(() => {
    setDrawer(false); setMenuOpen(false); setSearchOpen(false); setQuery("");
    window.scrollTo?.({ top: 0 });
  }, [location.pathname]);

  /* ── lock scroll when the drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  /* ── click-outside / Escape / ⌘K ── */
  useEffect(() => {
    const down = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); inputRef.current?.focus(); setSearchOpen(true);
      }
      if (e.key === "Escape") { setMenuOpen(false); setSearchOpen(false); setDrawer(false); }
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, []);

  /* ── school details (cached, refreshed once) ── */
  useEffect(() => {
    if (variant !== "admin" || school || !decoded?.id || !online) return;
    api.get(`/api/schools/user/${decoded.id}`)
      .then(({ data }) => {
        const s = data?.school || data;
        if (s && typeof s === "object" && !Array.isArray(s)) {
          localStorage.setItem("schoolData", JSON.stringify(s));
          setSchool(s);
        }
      })
      .catch(() => {});
  }, [variant, school, decoded, online]);

  useEffect(() => {
    const sync = () => setSchool(readJSON("schoolData", null));
    window.addEventListener("schoolDataUpdated", sync);
    return () => window.removeEventListener("schoolDataUpdated", sync);
  }, []);

  /* ── unread notifications ── */
  const loadUnread = useCallback(async () => {
    if (!userId || !online || variant === "superadmin") return;
    try {
      if (variant === "teacher") {
        const { data } = await api.get(`/api/notification/unread-count/${userId}`);
        setUnread(Number(data?.count) || 0);
      } else {
        const { data } = await api.get(`/api/notification/user/${userId}`);
        const list = Array.isArray(data) ? data : [];
        setUnread(list.filter((n) => !(n.readBy || []).includes(userId)).length);
      }
    } catch { /* badge is best-effort */ }
  }, [userId, online, variant]);

  useEffect(() => { loadUnread(); }, [loadUnread, location.pathname]);

  useEffect(() => {
    if (variant === "superadmin") return undefined;
    const socket = getSocket();
    const bump = () => setUnread((n) => n + 1);
    socket.on("new-notification", bump);
    return () => { socket.off("new-notification", bump); };
  }, [variant]);

  /* ── logout ── */
  const logout = useCallback(() => {
    const token = localStorage.getItem("token");
    if (variant !== "teacher" && token) {
      api.post("/api/users/logout", {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    clearSession();
    toast.success("Logged out");
    navigate(loginPathFor(role), { replace: true });
  }, [navigate, role, variant]);

  /* ── nav visibility ── */
  const visible = useCallback((item) => {
    if (variant !== "teacher") return true;
    if (!item.when || !teacherType) return true;
    if (teacherType === "Both") return true;
    return item.when === "class" ? teacherType === "Class Teacher" : teacherType === "Subject Teacher";
  }, [variant, teacherType]);

  const sections = useMemo(
    () => nav.sections.map((s) => ({ ...s, items: s.items.filter(visible) })).filter((s) => s.items.length),
    [nav, visible],
  );

  /* ── quick search ── */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pages = flatNav(variant).filter(visible)
      .filter((i) => i.label.toLowerCase().includes(q))
      .map((i) => ({ key: i.to, label: i.label, hint: "Go to page", to: i.to, Icon: i.icon }));
    if (variant === "admin") {
      pages.push(
        { key: "s", label: `Find student “${query.trim()}”`, hint: "Students", to: `/students?q=${encodeURIComponent(query.trim())}`, Icon: Search },
        { key: "t", label: `Find teacher “${query.trim()}”`, hint: "Teachers", to: `/teachers?q=${encodeURIComponent(query.trim())}`, Icon: Search },
      );
    }
    return pages.slice(0, 7);
  }, [query, variant, visible]);

  useEffect(() => setCursor(0), [query]);

  const go = (to) => { setSearchOpen(false); setQuery(""); navigate(to); };
  const onSearchKey = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => (c + 1) % results.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => (c - 1 + results.length) % results.length); }
    if (e.key === "Enter") { e.preventDefault(); go(results[cursor].to); }
  };

  const pageTitle = titleFor(variant, location.pathname);
  const notifPath = variant === "teacher" ? "/notifications2" : "/notifications";
  const settingsPath = variant === "admin" ? "/school-settings" : null;

  const renderNav = () => (
    <nav className="as-nav" aria-label="Main navigation">
      {sections.map((s) => (
        <div className="as-nav-section" key={s.label}>
          {sections.length > 1 && <p className="as-nav-label">{s.label}</p>}
          {s.items.map((item) => {
            const active = isItemActive(item, location.pathname);
            const blocked = !online && variant === "teacher" && !item.offline;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`as-link ${active ? "active" : ""} ${blocked ? "disabled" : ""}`}
                aria-current={active ? "page" : undefined}
                aria-disabled={blocked || undefined}
                tabIndex={blocked ? -1 : undefined}
                onClick={(e) => { if (blocked) { e.preventDefault(); toast("Not available offline"); } }}
              >
                <span className="as-link-ico"><Icon size={17} strokeWidth={2.1} /></span>
                <span className="as-link-text">{item.label}</span>
                {item.to === notifPath && unread > 0 && <span className="as-count">{unread > 99 ? "99+" : unread}</span>}
                {blocked && <WifiOff size={13} className="as-link-off" />}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const sidebar = (
    <>
      <div className="as-brand">
        <div className="as-brand-logo">
          {school?.logo ? <img src={school.logo} alt="" /> : <GraduationCap size={21} />}
        </div>
        <div className="as-brand-text">
          <strong title={schoolName}>{schoolName}</strong>
          <span>{variant === "superadmin" ? "Platform Console" : variant === "teacher" ? "Teacher Portal" : "Management Portal"}</span>
        </div>
      </div>
      {renderNav()}
      <div className="as-side-foot">
        <div className="as-user-card">
          <div className="avatar as-avatar">{initials(fullName)}</div>
          <div className="as-user-meta">
            <strong>{fullName}</strong>
            <span>{ROLE_LABEL[role] || role}</span>
          </div>
          <button className="as-logout" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`app-shell app-shell--${variant}`}>
      <a href="#main-content" className="as-skip">Skip to content</a>

      <aside className="app-sidebar" aria-label="Sidebar">{sidebar}</aside>

      {drawer && <div className="as-overlay" onClick={() => setDrawer(false)} />}
      <aside className={`as-drawer ${drawer ? "open" : ""}`} aria-hidden={!drawer} aria-label="Menu">
        <button className="as-drawer-close" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={18} /></button>
        {sidebar}
      </aside>

      <div className="shell-content">
        <header className="app-topbar">
          <button className="as-icon-btn as-burger" onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="as-title">
            <h1>{pageTitle || "Welcome"}</h1>
            <span>{schoolName}</span>
          </div>

          <div className={`as-search ${searchOpen ? "open" : ""}`} ref={searchRef}>
            <Search size={15} className="as-search-ico" />
            <input
              ref={inputRef}
              value={query}
              placeholder={variant === "admin" ? "Search pages, students, teachers…" : "Jump to a page…"}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onSearchKey}
              aria-label="Search"
            />
            <kbd className="as-kbd">Ctrl K</kbd>
            {searchOpen && query.trim() && (
              <ul className="as-results" role="listbox">
                {results.length === 0 && <li className="as-result-empty">No matches</li>}
                {results.map((r, i) => (
                  <li key={r.key} role="option" aria-selected={i === cursor}>
                    <button className={i === cursor ? "on" : ""} onMouseEnter={() => setCursor(i)} onClick={() => go(r.to)}>
                      <r.Icon size={15} />
                      <span>{r.label}</span>
                      <em>{r.hint}</em>
                      {i === cursor && <CornerDownLeft size={13} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="as-actions">
            {!online && <span className="as-offline" title="You are offline"><WifiOff size={14} /> Offline</span>}

            {variant !== "superadmin" && (
              <button className="as-icon-btn" onClick={() => navigate(notifPath)} aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}>
                <Bell size={19} />
                {unread > 0 && <span className="as-badge">{unread > 9 ? "9+" : unread}</span>}
              </button>
            )}

            <div className="as-user" ref={menuRef}>
              <button className="as-user-btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
                <span className="avatar">{initials(fullName)}</span>
                <span className="as-user-name">{fullName}</span>
                <ChevronDown size={14} className={menuOpen ? "flip" : ""} />
              </button>
              {menuOpen && (
                <div className="as-menu" role="menu">
                  <div className="as-menu-head">
                    <strong>{fullName}</strong>
                    <span>{ROLE_LABEL[role] || role}</span>
                  </div>
                  {settingsPath && (
                    <button role="menuitem" onClick={() => navigate(settingsPath)}><Settings size={15} /> School settings</button>
                  )}
                  <button role="menuitem" className="danger" onClick={logout}><LogOut size={15} /> Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="main-content" className="shell-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
