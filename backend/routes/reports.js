// backend/routes/reports.js

import express from "express";
import Report from "../models/Report.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/reports
 * @desc    Get all reports for the logged‑in user
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/reports
 * @desc    Create a new report
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  const { title, description, caseId } = req.body;
  try {
    const report = new Report({
      title,
      description,
      case: caseId,
      user: req.user._id,
      createdAt: Date.now(),
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/reports/:id
 * @desc    Get a single report by ID
 * @access  Private
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || report.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/reports/:id
 * @desc    Update a report
 * @access  Private
 */
router.put("/:id", protect, async (req, res) => {
  try {
    let report = await Report.findById(req.params.id);
    if (!report || report.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Report not found" });
    }
    report.title = req.body.title || report.title;
    report.description = req.body.description || report.description;
    await report.save();
    res.json(report);
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a report
 * @access  Private
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || report.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Report not found" });
    }
    await report.remove();
    res.json({ message: "Report removed" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
