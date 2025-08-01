import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

// GET /api/cases - List cases
router.get("/", protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (req.user.role === "advocate") {
      query.createdBy = req.user._id;
    }

    if (status) query.status = status;

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
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// POST /api/cases - Create case
router.post("/", protect, async (req, res) => {
  try {
    const newCase = new Case({ ...req.body, createdBy: req.user._id });
    const saved = await newCase.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create case error:", err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/cases/:id - Update case
router.put("/:id", protect, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === "advocate") filter.createdBy = req.user._id;

    const updated = await Case.findOneAndUpdate(filter, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Case not found or no permission" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Update case error:", err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cases/:id - Delete case
router.delete("/:id", protect, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === "advocate") filter.createdBy = req.user._id;

    const deleted = await Case.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ error: "Case not found or no permission" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete case error:", err);
    res.status(500).json({ error: "Failed to delete case" });
  }
});

// POST /api/cases/:id/upload - Upload file
router.post("/:id/upload", protect, upload.single("file"), async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ error: "Case not found" });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const doc = {
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    };

    caseItem.documents.push(doc);
    await caseItem.save();

    res.status(200).json({ message: "File uploaded", document: doc });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// POST /api/cases/:id/comments - Add comment
router.post("/:id/comments", protect, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 1) {
    return res.status(400).json({ error: "Comment text required" });
  }

  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user._id,
            text: text.trim(),
            createdAt: new Date(),
          },
        },
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
