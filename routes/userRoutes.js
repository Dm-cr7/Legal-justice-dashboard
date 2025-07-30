// backend/routes/userRoutes.js

import express from "express"
import User from "../models/User.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// ─── GET /api/users/profile ───────────────────────────────────────────────────
// Returns the current user’s basic info: name, email, and role.
router.get(
  "/profile",
  verifyUser,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("name email role")
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      res.json(user)
    } catch (err) {
      console.error("Profile fetch error:", err)
      res.status(500).json({ error: "Server error" })
    }
  }
)

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
// Update the current user’s name and email.
router.put(
  "/profile",
  verifyUser,
  async (req, res) => {
    const { name, email } = req.body
    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Name and email are required" })
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { name, email },
        { new: true, runValidators: true }
      ).select("name email role")

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json(updatedUser)
    } catch (err) {
      console.error("Profile update error:", err)
      res.status(500).json({ error: "Could not update profile" })
    }
  }
)

// ─── PUT /api/users/password ──────────────────────────────────────────────────
// Change the current user’s password (requires current password).
router.put(
  "/password",
  verifyUser,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current and new passwords are required" })
    }

    try {
      // Load the user including the password hash
      const user = await User.findById(req.userId).select("+password")
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Verify the current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "Current password is incorrect" })
      }

      // Set and save the new password (hashed in pre-save hook)
      user.password = newPassword
      await user.save()

      res.json({ message: "Password updated successfully" })
    } catch (err) {
      console.error("Password change error:", err)
      res.status(500).json({ error: "Could not update password" })
    }
  }
)

export default router
