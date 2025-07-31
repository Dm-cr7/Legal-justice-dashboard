// src/api/axios.js

import axios from "axios";

// Determine the backend base URL from environment (Render) or fallback to local dev
// For separate Render services, we must use the absolute URL for the backend.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

// Create and export an Axios instance preconfigured for your API
const API = axios.create({
  baseURL,
  withCredentials: true, // Send cookies (for auth) across origins
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default API;