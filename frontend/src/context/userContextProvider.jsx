// UserContextProvider.jsx
import { createContext, useState, useEffect } from "react";
import axios from '../api/axios';


export const UserContext = createContext(null);

const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
   
  // Fetch user details including role
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/users/profile", { withCredentials: true });
      setCurrentUser(response.data.data); // Use `response.data.data` for actual user object
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    currentUser,
    fetchUserDetails,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
