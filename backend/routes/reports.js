import express from "express";
import Report from "../models/Report.js";
import Case from "../models/Case.js";
import Task from "../models/Task.js";
import Client from "../models/Client.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * ✅ GET /api/reports/summary – MUST come before /:id
 */
router.get("/summary", protect, async (req, res) => {
  try {
    const [totalCases, totalClients, openTasks, overdueTasks] = await Promise.all([
      Case.countDocuments({ createdBy: req.user._id }),
      Client.countDocuments({ createdBy: req.user._id }),
      Task.countDocuments({ createdBy: req.user._id, completed: false }),
      Task.countDocuments({
        createdBy: req.user._id,
        completed: false,
        dueDate: { $lt: new Date() },
      }),
    ]);

    res.json({ totalCases, totalClients, openTasks, overdueTasks });
  } catch (err) {
    console.error("❌ Error in /summary:", err);
    res.status(500).json({ error: "Failed to load summary data." });
  }
});

/**
 * ✅ GET /api/reports/charts – MUST come before /:id
 */
router.get("/charts", protect, async (req, res) => {
  try {
    const userId = req.user._id;

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
      const target = months.find((m) => m.year === _id.year && m.month === _id.month);
      if (target) {
        if (_id.status === "Closed") target.closedCases += count;
        else target.newCases += count;
      }
    });

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
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ monthlyCaseData: months, caseStatusData });
  } catch (err) {
    console.error("❌ Error in /charts:", err);
    res.status(500).json({ error: "Failed to load chart data." });
  }
});

/**
 * GET /api/reports – List all reports
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
 * POST /api/reports – Create a report
 */
router.post("/", protect, async (req, res) => {
  const { title, description, caseId } = req.body;

  if (!title || !caseId) {
    return res.status(400).json({ message: "Title and caseId are required" });
  }

  try {
    const report = new Report({
      title: title.trim(),
      description: description?.trim() || "",
      case: caseId,
      user: req.user._id,
    });

    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ 🔥 THIS MUST COME LAST 🔥
 * GET /api/reports/:id – Get a report by ID
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("case", "title");

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
 * PUT /api/reports/:id – Update a report
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...(req.body.title && { title: req.body.title.trim() }),
        ...(req.body.description !== undefined && {
          description: req.body.description.trim(),
        }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/reports/:id – Delete a report
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Report.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Report not found or unauthorized" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
