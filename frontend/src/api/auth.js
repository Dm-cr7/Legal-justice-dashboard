// src/api/auth.js

const API = import.meta.env.VITE_API_URL; // Example: https://your-backend-url.com

// Register a new user
export async function registerUser({ name, email, password, role }) {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return { success: true, message: data.message };
  } catch (err) {
    console.error("Register error:", err.message);
    return { success: false, message: err.message };
  }
}

// Login a user and store token + role
export async function loginUser({ email, password }) {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    const { token, user } = data;

    if (token) localStorage.setItem("token", token);
    if (user?.role) localStorage.setItem("role", user.role);

    return { success: true, user };
  } catch (err) {
    console.error("Login error:", err.message);
    return { success: false, message: err.message };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    const user = await res.json();

    if (!res.ok) {
      throw new Error(user.message || "Failed to fetch user");
    }

    if (user.role) {
      localStorage.setItem("role", user.role);
    }

    return user;
  } catch (err) {
    console.error("getCurrentUser error:", err.message);
    return null;
  }
}
