import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const logout = () => {
    localStorage.clear();
    setCurrentUser(null);
    window.location.href = "/sign-in"; // safer navigation
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in local storage.");
        return;
      }
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      console.log("Token Expiry Time:", decoded.exp);
      console.log("Current Time:", currentTime);
      if (decoded.exp < currentTime) {
       
        logout();
        return;
      }
      // If user is not an admin, just use decoded info
      if (decoded.role !== "admin") {
        setCurrentUser(decoded);
        return;
      }
      // For admin, fetch full profile
      const response = await api.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error?.response?.data || error.message);
      // logout(); // comment this to test behavior
    }
  };
  
  useEffect(() => {
    fetchUserDetails();

    // Optional: auto-check every 30s if token expired
    const interval = setInterval(() => {
      fetchUserDetails();
    }, 30000); // every 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, fetchUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
