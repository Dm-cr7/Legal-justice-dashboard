// backend/server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Load environment variables
dotenv.config();

// Debug: ensure FRONTEND_URL is loaded
console.log("🛠️ FRONTEND_URL:", process.env.FRONTEND_URL);

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// -------- CORS SETUP FOR /api ROUTES --------
const corsOptions = {
  origin: process.env.FRONTEND_URL,    // e.g. "https://legal-dashboard-frontend.onrender.com"
  credentials: true,                   // allow cookies/auth headers
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
};
app.use("/api", cors(corsOptions));
app.options("/api/*", cors(corsOptions));  // explicit preflight handling

// -------- BODY PARSERS --------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- API ROUTES --------
import authRoutes from "./routes/auth.js";
import caseRoutes from "./routes/cases.js";
import clientRoutes from "./routes/clients.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reports.js";
import userRoutes from "./routes/userRoutes.js";
import { protect } from "./middleware/auth.js";

// Public auth endpoints
app.use("/api/auth", authRoutes);

// Protected endpoints
app.use("/api/cases", protect, caseRoutes);
app.use("/api/clients", protect, clientRoutes);
app.use("/api/tasks", protect, taskRoutes);
app.use("/api/reports", protect, reportRoutes);
app.use("/api/users", protect, userRoutes);

// -------- STATIC FRONTEND SETUP --------
const clientBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(clientBuildPath));

// -------- SPA FALLBACK FOR CLIENT‑SIDE ROUTING --------
app.get("*", (req, res, next) => {
  // Skip API and asset requests
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), err => {
    if (err) {
      console.error("⚠️ Failed to serve index.html:", err);
      res.status(500).send("Frontend not found");
    }
  });
});

// -------- ERROR HANDLING --------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

// -------- MONGODB CONNECTION & SERVER START --------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
