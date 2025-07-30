// src/api/axios.js
import axios from "axios";

// Determine the backend base URL: from environment or fallback to local
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

// Create an axios instance
const API = axios.create({
  baseURL,
  withCredentials: true, // Send and receive cookies (for authentication)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default API;
