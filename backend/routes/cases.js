import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Ensure uploads dir exists
const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 🔍 GET all cases (with role-based filtering)
router.get("/", protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    const userId = req.user._id.toString();
    const role   = req.user.role;

    // Build query
    let query = {};
    if (role === "advocate") {
      query.createdBy = userId;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ];
    }

    const cases = await Case.find(query).sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    console.error("❌ Fetch cases error:", err);
    res.status(500).send("Server error");
  }
});

// ➕ Create new case
router.post("/", protect, async (req, res) => {
  try {
    const newCase = new Case({
      ...req.body,
      createdBy: req.user._id
    });
    const saved = await newCase.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create case error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✏️ Update case
router.put("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role   = req.user.role;
    const filter = { _id: req.params.id };
    if (role === "advocate") filter.createdBy = userId;

    const updated = await Case.findOneAndUpdate(filter, req.body, { new: true });
    if (!updated) {
      return res
        .status(404)
        .send("Case not found or you do not have permission to edit it.");
    }
    res.json(updated);
  } catch (err) {
    console.error("❌ Update case error:", err);
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ Delete case
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role   = req.user.role;
    const filter = { _id: req.params.id };
    if (role === "advocate") filter.createdBy = userId;

    const deleted = await Case.findOneAndDelete(filter);
    if (!deleted) {
      return res
        .status(404)
        .send("Case not found or you do not have permission to delete it.");
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete case error:", err);
    res.status(500).send("Server error");
  }
});

// 📁 Upload document to case
router.post(
  "/:id/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const caseItem = await Case.findById(req.params.id);
      if (!caseItem) return res.status(404).json({ error: "Case not found" });

      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const fileMeta = {
        filename:  file.originalname,
        url:       `/uploads/${file.filename}`,
        mimetype:  file.mimetype,
        uploadedAt: new Date()
      };

      caseItem.documents.push(fileMeta);
      await caseItem.save();

      res.status(200).json({ message: "File uploaded", document: fileMeta });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// 💬 Add comment to case
router.post("/:id/comments", protect, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text required" });

  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user:      req.user._id,
            text,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate("comments.user", "name");

    if (!updated) return res.status(404).json({ error: "Case not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
