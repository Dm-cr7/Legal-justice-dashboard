// src/api/axios.js

import axios from "axios";

// Determine backend URL from environment variable
const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawBaseURL.replace(/\/+$/, ""); // Remove trailing slashes if any

// Create axios instance
const API = axios.create({
  baseURL, // e.g. https://your-backend.com
  withCredentials: true, // Needed to send cookies in cross-origin requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: Attach JWT token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && typeof token === "string") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor (e.g. auto-logout on 401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: redirecting to login...");
      // Optional: redirect or logout logic
    }
    return Promise.reject(error);
  }
);

export default API;
