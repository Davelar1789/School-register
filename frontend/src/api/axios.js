// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://school-register-a2bx.onrender.com",
  withCredentials: true, // Required if cookies are used for authentication
});

// ✅ Attach the interceptor to the custom `api` instance
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      error.response.data?.message === "Token expired. Please log in again."
    ) {
      localStorage.removeItem("token");
      window.location.href = "/sign-in"; // or use a React router redirect if you're using that
    }
    return Promise.reject(error);
  }
);

export default api;
