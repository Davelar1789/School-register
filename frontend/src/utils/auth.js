import { jwtDecode } from "jwt-decode";

/** Everything the app stores about a session. */
const SESSION_KEYS = ["token", "user", "teacher", "schoolData", "schoolId", "userId", "offlineAdmin"];

export const getToken = () => {
  try { return localStorage.getItem("token"); } catch { return null; }
};

export const decodeToken = (token = getToken()) => {
  if (!token) return null;
  try { return jwtDecode(token); } catch { return null; }
};

export const getRole = () => decodeToken()?.role || null;

export const isExpired = (decoded = decodeToken()) =>
  !!decoded?.exp && decoded.exp * 1000 < Date.now();

/** Which login screen belongs to a role. */
export const loginPathFor = (role) =>
  role === "Teacher" || role === "teacher" ? "/teacher-login" : "/sign-in";

/** Where a role lands after logging in. */
export const homePathFor = (role) => {
  if (role === "admin") return "/dashboard";
  if (role === "superadmin") return "/superadmin";
  if (role === "Teacher" || role === "teacher") return "/teacher-dashboard";
  return "/";
};

export const clearSession = () => {
  try { SESSION_KEYS.forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ }
};

export const readJSON = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";
