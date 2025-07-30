// backend/routes/taskRoutes.js

import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the logged-in user
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("❌ Fetch tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      user: req.user._id,
    });
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create task error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },  // ensures owner-only update
      req.body,
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Task not found or you do not have permission to edit it." });
    }
    res.json(updated);
  } catch (err) {
    console.error("❌ Update task error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,  // ensures owner-only delete
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Task not found or you do not have permission to delete it." });
    }
    res.json({ message: "Task removed" });
  } catch (err) {
    console.error("❌ Delete task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
