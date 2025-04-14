// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://school-register-a2bx.onrender.com", // Local fallback for development
  withCredentials: true, // Required if cookies are used for authentication
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && error.response.data?.message === "Token expired. Please log in again.") {
      // Redirect to login or logout
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
