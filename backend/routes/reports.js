import express from "express";
import fs from "fs";
import path from "path";
import Report from "../models/Report.js";
import Case from "../models/Case.js";
import Task from "../models/Task.js";
import Client from "../models/Client.js";
import { protect } from "../middleware/auth.js";
import { s3 } from "../utils/awsS3.js"; // Import the S3 client

const router = express.Router();

/**
 * GET /api/reports/summary
 * Summary counts of cases, clients, tasks etc for dashboard
 */
router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalCases, totalClients, openTasks, overdueTasks] = await Promise.all([
      Case.countDocuments({ createdBy: userId }),
      Client.countDocuments({ createdBy: userId }),
      Task.countDocuments({ createdBy: userId, completed: false }),
      Task.countDocuments({ createdBy: userId, completed: false, dueDate: { $lt: new Date() } }),
    ]);

    res.json({ totalCases, totalClients, openTasks, overdueTasks });
  } catch (err) {
    console.error("❌ Error in GET /summary:", err);
    res.status(500).json({ error: "Failed to load summary data." });
  }
});

/**
 * GET /api/reports/charts
 * Aggregated case data for charts
 */
router.get("/charts", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate new and closed cases grouped by month (last 6 months)
    const rawData = await Case.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Prepare months array for last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        name: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        newCases: 0,
        closedCases: 0,
      };
    });

    rawData.forEach(({ _id, count }) => {
      const monthEntry = months.find((m) => m.year === _id.year && m.month === _id.month);
      if (monthEntry) {
        if (_id.status === "Closed") monthEntry.closedCases += count;
        else monthEntry.newCases += count;
      }
    });

    // Case status totals for pie chart
    const caseStatusData = await Case.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
    ]);

    res.json({ monthlyCaseData: months, caseStatusData });
  } catch (err) {
    console.error("❌ Error in GET /charts:", err);
    res.status(500).json({ error: "Failed to load chart data." });
  }
});

/**
 * GET /api/reports
 * List all reports of authenticated user
 */
router.get("/", protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("case", "title")
      .lean();

    res.json(reports);
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/reports
 * Create a new report and set status to pending (simulate generation)
 */
router.post("/", protect, async (req, res) => {
  const { title, description, caseId } = req.body;

  if (!title || !caseId) {
    return res.status(400).json({ message: "Title and caseId are required" });
  }

  try {
    // Create report with status 'pending'
    const report = new Report({
      title: title.trim(),
      description: description?.trim() || "",
      case: caseId,
      user: req.user._id,
      status: "pending",
      createdAt: new Date(),
    });

    const savedReport = await report.save();

    // Here, trigger your actual report generation async job (e.g., queue, worker, lambda etc)
    // For demonstration, simulate async report generation with timeout:
    setTimeout(async () => {
      try {
        // Simulate generated file URL (in real case, upload file and get S3 URL or similar)
        const fakeFileUrl = `https://your-s3-bucket.s3.amazonaws.com/reports/${savedReport._id}.pdf`;

        await Report.findByIdAndUpdate(savedReport._id, {
          status: "ready",
          fileUrl: fakeFileUrl,
          generatedAt: new Date(),
          size: 123456, // Example file size in bytes
        });
      } catch (err) {
        console.error("❌ Error during report generation simulation:", err);
        await Report.findByIdAndUpdate(savedReport._id, { status: "failed", error: "Generation failed" });
      }
    }, 10000); // 10 seconds delay simulating generation

    res.status(201).json(savedReport);
  } catch (err) {
    console.error("❌ Error creating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/reports/:id
 * Get report details by ID including status
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id })
      .populate("case", "title")
      .lean();

    if (!report) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    res.json(report);
  } catch (err) {
    console.error("❌ Error fetching report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/reports/:id/download
 * Download the generated report file
 */
router.get("/:id/download", protect, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).lean();

    if (!report) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    if (report.status !== "ready" || !report.fileUrl) {
      return res.status(400).json({ message: "Report is not ready for download" });
    }

    // If using S3 - stream the file directly to client
    // Assuming fileUrl is an S3 key or full URL; adjust accordingly
    // Example: fileUrl = https://bucket.s3.amazonaws.com/key.pdf
    // Parse S3 key from fileUrl:
    const url = new URL(report.fileUrl);
    const bucket = url.hostname.split('.')[0]; // e.g. your-s3-bucket
    const key = decodeURIComponent(url.pathname.substring(1)); // remove leading /

    // Using AWS SDK S3 getObject to stream file
    const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/\s+/g, "_")}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");

    s3Stream.on("error", (err) => {
      console.error("❌ Error streaming file from S3:", err);
      res.status(500).json({ message: "Failed to download file" });
    });

    s3Stream.pipe(res);
  } catch (err) {
    console.error("❌ Error in report download:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/reports/:id
 * Update report (title or description)
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.title) updateFields.title = req.body.title.trim();
    if (req.body.description !== undefined) updateFields.description = req.body.description.trim();

    const updatedReport = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateFields,
      { new: true }
    ).lean();

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    res.json(updatedReport);
  } catch (err) {
    console.error("❌ Error updating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete report and optionally delete file from S3
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!report) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    // Optionally delete the file from S3 if exists
    if (report.fileUrl) {
      try {
        const url = new URL(report.fileUrl);
        const bucket = url.hostname.split('.')[0];
        const key = decodeURIComponent(url.pathname.substring(1));
        await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
      } catch (s3Err) {
        console.error("❌ Error deleting report file from S3:", s3Err);
      }
    }

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
