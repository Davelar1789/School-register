// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://school-register-a2bx.onrender.com", // Local fallback for development
  withCredentials: true, // Required if cookies are used for authentication
});

export default api;
