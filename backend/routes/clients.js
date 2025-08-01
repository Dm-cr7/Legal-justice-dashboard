import express from "express";
import Client from "../models/Client.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/clients
 * Get all clients created by the logged-in user
 */
router.get("/", protect, async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error("❌ GET /clients failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/clients
 * Create a new client
 */
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newClient = new Client({
      name: name.trim(),
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      notes: notes?.trim() || "",
      createdBy: req.user._id,
    });

    await newClient.save();
    res.status(201).json(newClient);
  } catch (err) {
    console.error("❌ POST /clients failed:", err);
    res.status(400).json({ message: err.message || "Invalid client data" });
  }
});

/**
 * PUT /api/clients/:id
 * Update an existing client
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    const update = {
      ...(name && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(notes !== undefined && { notes: notes.trim() }),
    };

    const updated = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Client not found or unauthorized" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /clients failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/clients/:id
 * Delete a client
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Client not found or unauthorized" });
    }

    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE /clients failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
