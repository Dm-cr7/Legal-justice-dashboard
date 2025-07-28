import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// ─── POST /api/auth/register ────────────────────────────────────────
// Registers a new user (name, email, password, role)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────
// Authenticates user and issues a JWT cookie
router.post("/login", async (req, res) => {
  // THIS IS THE DEBUGGING LINE WE ARE ADDING
  console.log("LOGIN ATTEMPT BODY:", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      })
      .json({ message: "Login successful", role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────
// Returns the current user (protected)
router.get("/me", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Fetch /me error:", err);
    res.status(500).json({ error: "Server error fetching user" });
  }
});

// ─── POST /api/auth/logout ──────────────────────────────────────────
// Clears the auth cookie
router.post("/logout", (req, res) => {
  res
    .clearCookie("token", { httpOnly: true, sameSite: "lax" })
    .json({ message: "Logged out successfully" });
});

export default router;
