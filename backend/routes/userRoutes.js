// backend/routes/userRoutes.js

import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Returns the current user’s basic info: name, email, and role.
 * @access  Private
 */
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update the current user’s name and email.
 * @access  Private
 */
router.put("/profile", protect, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select("name email role");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    Change the current user’s password (requires current password).
 * @access  Private
 */
router.put("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both current and new passwords are required" });
  }

  try {
    // Load the user including the password hash
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Set and save the new password (hashed in pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Password change error:", err);
    res.status(500).json({ error: "Could not update password" });
  }
});

export default router;
