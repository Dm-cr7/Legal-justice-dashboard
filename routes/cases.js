import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import Case from "../models/Case.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Ensure uploads dir exists
const UPLOAD_DIR = path.resolve("uploads")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// 🔍 GET all cases (with role-based filtering)
router.get("/", verifyUser, async (req, res) => {
  try {
    const { search, status } = req.query
    const { userId, role } = req // Get role and userId from verifyUser middleware

    // --- THIS IS THE FIX ---
    // Start with a base query object
    let query = {}

    // If the user is an advocate, only show cases they created.
    // If the user is a paralegal, this filter is skipped, so they see all cases.
    if (role === 'advocate') {
        query.createdBy = userId;
    }
    // --- END OF FIX ---

    // Add optional filters for status and search to the query
    if (status) {
        query.status = status;
    }
    if (search) {
        query.$or = [
            { title: new RegExp(search, "i") },
            { description: new RegExp(search, "i") }
        ];
    }

    const cases = await Case.find(query).sort({ createdAt: -1 })
    res.json(cases)
  } catch (err) {
    console.error("❌ Fetch cases error:", err)
    res.status(500).send("Server error")
  }
})

// ➕ Create new case
router.post("/", verifyUser, async (req, res) => {
  try {
    const newCase = new Case({ ...req.body, createdBy: req.userId })
    const saved = await newCase.save()
    res.status(201).json(saved)
  } catch (err) {
    console.error("❌ Create case error:", err)
    res.status(400).json({ error: err.message })
  }
})

// ✏️ Update case
router.put("/:id", verifyUser, async (req, res) => {
  try {
    // Advocates can only update their own cases. Paralegals can update any.
    const query = { _id: req.params.id };
    if (req.role === 'advocate') {
        query.createdBy = req.userId;
    }

    const updated = await Case.findOneAndUpdate(
      query,
      req.body,
      { new: true }
    )
    if (!updated) return res.status(404).send("Case not found or you do not have permission to edit it.")
    res.json(updated)
  } catch (err) {
    console.error("❌ Update case error:", err)
    res.status(400).json({ error: err.message })
  }
})

// 🗑️ Delete case
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    // Advocates can only delete their own cases. Paralegals can delete any.
    const query = { _id: req.params.id };
    if (req.role === 'advocate') {
        query.createdBy = req.userId;
    }
    const deleted = await Case.findOneAndDelete(query)
    if (!deleted) return res.status(404).send("Case not found or you do not have permission to delete it.")
    res.json({ success: true })
  } catch (err) {
    console.error("❌ Delete case error:", err)
    res.status(500).send("Server error")
  }
})

// 📁 Upload document to case
router.post("/:id/upload", verifyUser, upload.single("file"), async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
    if (!caseItem) return res.status(404).json({ error: "Case not found" })

    const file = req.file
    if (!file) return res.status(400).json({ error: "No file uploaded" })

    const fileMeta = {
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }

    caseItem.documents.push(fileMeta)
    await caseItem.save()

    res.status(200).json({ message: "File uploaded", document: fileMeta })
  } catch (err) {
    console.error("❌ Upload error:", err)
    res.status(500).json({ error: "Upload failed" })
  }
})

// 💬 Add comment to case
router.post("/:id/comments", verifyUser, async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: "Comment text required" })

  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.userId,
            text,
            createdAt: new Date()
          },
        },
      },
      { new: true }
    ).populate("comments.user", "name")

    if (!updated) return res.status(404).json({ error: "Case not found" })
    res.json(updated)
  } catch (err) {
    console.error("❌ Add comment error:", err)
    res.status(500).json({ error: "Failed to add comment" })
  }
})

export default router
