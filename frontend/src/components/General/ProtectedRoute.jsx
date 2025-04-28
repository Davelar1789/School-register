// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/sign-in" />;

  try {
    const { role } = JSON.parse(atob(token.split('.')[1]));
    if (allowedRoles.includes(role)) {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  } catch (error) {
    return <Navigate to="/sign-in" />;
  }
};

export default ProtectedRoute;
