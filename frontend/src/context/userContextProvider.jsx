// UserContextProvider.jsx
import { createContext, useState, useEffect } from "react";
import axios from '../api/axios';


export const UserContext = createContext(null);

const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
    const [cartTotalQuantity, setCartTotalQuantity] = useState(0);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);

  // Update cart values (optional for your use case)
  const updateCartTotal = (total) => setCartTotalAmount(total);
  const updateCartTotalQuantity = (total) => setCartTotalQuantity(total);

  // Fetch user details including role
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/auth/user-info", { withCredentials: true });
      setCurrentUser(response.data.data); // Use `response.data.data` for actual user object
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    currentUser,
    cartTotalAmount,
    cartTotalQuantity,
    fetchUserDetails,
    updateCartTotal,
    updateCartTotalQuantity,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
