// src/api/auth.js

const API = import.meta.env.VITE_API_URL; // e.g. "https://legal-justice-dashboard.onrender.com"

// Register a new user with role support
export async function registerUser({ name, email, password, role }) {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // for cookies/sessions
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    return { success: true, message: data.message };
  } catch (err) {
    console.error("Register error:", err.message);
    return { success: false, message: err.message };
  }
}

// Log in a user and persist their token and role
export async function loginUser({ email, password }) {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const { token, user } = data;

    // Store token and role in localStorage for frontend use
    localStorage.setItem("token", token);
    if (user?.role) {
      localStorage.setItem("role", user.role);
    }

    return { success: true, user };
  } catch (err) {
    console.error("Login error:", err.message);
    return { success: false, message: err.message };
  }
}

// Fetch the current authenticated user
export async function getCurrentUser() {
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch user");

    const user = await res.json();

    // Optional: update localStorage with role if available
    if (user.role) {
      localStorage.setItem("role", user.role);
    }

    return user; // { id, name, email, role, etc. }
  } catch (err) {
    console.error("getCurrentUser error:", err.message);
    return null;
  }
}
