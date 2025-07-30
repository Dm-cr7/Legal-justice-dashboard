// src/api/axios.js
import axios from "axios";

// Use the VITE_API_URL env var (set to your Render URL), falling back to localhost
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true, // allows cookies (for auth)
});

export default API;
