import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { clearSession, decodeToken, isExpired, loginPathFor } from "../utils/auth";

const UserContext = createContext({ currentUser: null, fetchUserDetails: async () => {}, logout: () => {} });

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const logout = useCallback(() => {
    const role = decodeToken()?.role;
    clearSession();
    setCurrentUser(null);
    window.location.href = loginPathFor(role);
  }, []);

  const fetchUserDetails = useCallback(async () => {
    const decoded = decodeToken();
    if (!decoded) { setCurrentUser(null); return; }

    // Teachers may legitimately hold an expired token while offline; others must sign in again.
    if (isExpired(decoded) && navigator.onLine) { logout(); return; }

    if (decoded.role !== "admin") { setCurrentUser(decoded); return; }

    try {
      const { data } = await api.get("/api/users/profile");
      setCurrentUser(data);
    } catch {
      setCurrentUser(decoded); // offline / transient failure: fall back to the token
    }
  }, [logout]);

  useEffect(() => {
    fetchUserDetails();
    // cheap local expiry check — no network involved
    const timer = setInterval(() => {
      const decoded = decodeToken();
      if (decoded && isExpired(decoded) && navigator.onLine) logout();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchUserDetails, logout]);

  const value = useMemo(() => ({ currentUser, fetchUserDetails, logout }), [currentUser, fetchUserDetails, logout]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
