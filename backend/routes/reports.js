import express from "express";
import mongoose from "mongoose";
import Case from "../models/Case.js";
import Client from "../models/Client.js"; // Assuming you have a Client model
import Task from "../models/Task.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

// GET /api/reports/summary – returns key metrics for StatCards
router.get("/summary", verifyUser, async (req, res) => {
  try {
    const { userId, role } = req;
    
    // Base query for role-based filtering
    const query = role === 'advocate' ? { createdBy: userId } : {};
    const clientQuery = role === 'advocate' ? { associatedAdvocate: userId } : {}; // Example for clients

    const [totalCases, totalClients, openTasks, overdueTasks] = await Promise.all([
      Case.countDocuments(query),
      Client.countDocuments(clientQuery),
      Task.countDocuments({ ...query, completed: false }),
      Task.countDocuments({ ...query, completed: false, dueDate: { $lt: new Date() } }),
    ]);

    res.json({
      totalCases,
      totalClients,
      openTasks,
      overdueTasks,
    });

  } catch (err) {
    console.error("Reports summary error:", err);
    res.status(500).json({ error: "Failed to generate summary report" });
  }
});


// GET /api/reports/charts – returns data formatted for charts
router.get("/charts", verifyUser, async (req, res) => {
    try {
        const { userId, role } = req;
        const matchQuery = role === 'advocate' ? { createdBy: new mongoose.Types.ObjectId(userId) } : {};

        // 1. Data for Pie Chart (Case Status Distribution)
        const caseStatusData = await Case.aggregate([
            { $match: matchQuery },
            { $group: { _id: "$status", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // 2. Data for Bar Chart (Monthly New vs. Closed Cases)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyCaseData = await Case.aggregate([
            { $match: { ...matchQuery, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    newCases: { $sum: 1 },
                    closedCases: {
                        $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { 
                $project: {
                    name: { 
                        $let: {
                            vars: { monthsInYear: [ "Error", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ] },
                            in: { $arrayElemAt: [ "$$monthsInYear", "$_id.month" ] }
                        }
                    },
                    newCases: 1,
                    closedCases: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            caseStatusData,
            monthlyCaseData
        });

    } catch (err) {
        console.error("Chart data error:", err);
        res.status(500).json({ error: "Failed to generate chart data" });
    }
});


export default router;
