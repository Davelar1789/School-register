import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, fetchUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Use User Context
export const useUserContext = () => useContext(UserContext);
