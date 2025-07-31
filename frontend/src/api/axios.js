// src/api/axios.js

import axios from "axios";

// For unified Render deployments, the frontend and backend are on the same domain.
// API calls should be relative to the current origin.
// The VITE_API_URL environment variable is no longer needed for this specific setup
// because the service itself handles both frontend and backend on the same URL.
const baseURL = "/api"; // <--- THIS IS THE KEY CHANGE: Now it's a relative path

// Create and export an Axios instance preconfigured for your API
const API = axios.create({
  baseURL,
  withCredentials: true, // Send cookies (for auth) across origins if your backend uses them
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default API;