// src/api/axios.js
import axios from "axios";

const PRIMARY_URL = "https://school-register-a2bx.onrender.com";
const BACKUP_URL = "https://school-register6.onrender.com";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || PRIMARY_URL,
  withCredentials: true,
});

// Intercept responses
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If it's a 503 and not already retried with backup
    if (
      error.response?.status === 503 &&
      !originalRequest._retry &&
      originalRequest.baseURL === PRIMARY_URL
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = BACKUP_URL;

      try {
        return await axios(originalRequest); // retry with backup
      } catch (err) {
        return Promise.reject(err); // If even backup fails
      }
    }

    // Token expired logic (unchanged)
    if (
      error.response?.status === 401 &&
      error.response.data?.message === "Token expired. Please log in again."
    ) {
      localStorage.removeItem("token");
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);

export default api;
