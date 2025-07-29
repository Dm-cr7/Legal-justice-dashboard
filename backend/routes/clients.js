import express from "express"
import jwt from "jsonwebtoken"
import Client from "../models/Client.js"

const router = express.Router()

// Middleware to get logged-in user ID from token
function authenticate(req, res, next) {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Unauthorized" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    res.status(401).json({ message: "Invalid token" })
  }
}

// GET /api/clients - Get all clients for logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.userId }).sort({ createdAt: -1 })
    res.json(clients)
  } catch (err) {
    console.error("GET /api/clients failed:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// POST /api/clients - Add a new client
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, contact, notes } = req.body
    if (!name || !contact) {
      return res.status(400).json({ message: "Name and contact are required" })
    }

    const newClient = new Client({
      name,
      contact,
      notes,
      createdBy: req.userId,
    })

    await newClient.save()
    res.status(201).json(newClient)
  } catch (err) {
    console.error("POST /api/clients failed:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// PUT /api/clients/:id - Update a client
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name, contact, notes } = req.body

    const updated = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { name, contact, notes },
      { new: true }
    )

    if (!updated) return res.status(404).json({ message: "Client not found or unauthorized" })

    res.json(updated)
  } catch (err) {
    console.error("PUT /api/clients failed:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE /api/clients/:id - Delete a client
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const deleted = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    })

    if (!deleted) return res.status(404).json({ message: "Client not found or unauthorized" })

    res.json({ message: "Client deleted" })
  } catch (err) {
    console.error("DELETE /api/clients failed:", err)
    res.status(500).json({ message: "Server error" })
  }
})
// DELETE /api/clients/:id - Delete a specific client
router.delete("/:id", async (req, res) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Unauthorized" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: userId,
    })

    if (!client) return res.status(404).json({ message: "Client not found" })

    res.json({ message: "Client deleted successfully" })
  } catch (err) {
    console.error("DELETE /api/clients/:id failed:", err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
