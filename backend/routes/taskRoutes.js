// backend/routes/taskRoutes.js

import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/tasks
 * Return all tasks created by the logged-in user
 */
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post("/", protect, async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Task title is required" });
  }

  try {
    const newTask = new Task({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "Pending",
      dueDate,
      createdBy: req.user._id,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task (only if it belongs to the logged-in user)
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task (only if it belongs to the logged-in user)
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
