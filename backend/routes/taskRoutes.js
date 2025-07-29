import express from "express"
import Task from "../models/Task.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// GET /api/tasks - Get tasks with role-based filtering
router.get("/", verifyUser, async (req, res) => {
  try {
    const { userId, role } = req;
    
    // --- THIS IS THE FIX ---
    let query = {};

    // If the user is an advocate, only show tasks they created.
    // If the user is a paralegal, the query remains empty, so they see all tasks.
    if (role === 'advocate') {
        query.createdBy = userId;
    }
    // --- END OF FIX ---

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("❌ Fetch tasks error:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
})

// POST /api/tasks - Create new task
router.post("/", verifyUser, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      dueDate,
      createdBy: req.userId,
    });
    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Create task error:", err);
    res.status(400).json({ message: "Failed to create task" });
  }
})

// PUT /api/tasks/:id - Update a task
router.put("/:id", verifyUser, async (req, res) => {
  try {
    const { userId, role } = req;
    let query = { _id: req.params.id };

    // Advocates can only update their own tasks.
    if (role === 'advocate') {
        query.createdBy = userId;
    }

    const task = await Task.findOneAndUpdate(
      query,
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found or you do not have permission to edit it." });
    res.json(task);
  } catch (err) {
    console.error("❌ Update task error:", err);
    res.status(400).json({ message: "Failed to update task" });
  }
})

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const { userId, role } = req;
    let query = { _id: req.params.id };

    // Advocates can only delete their own tasks.
    if (role === 'advocate') {
        query.createdBy = userId;
    }

    const deleted = await Task.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ message: "Task not found or you do not have permission to delete it." });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ Delete task error:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
})

export default router
