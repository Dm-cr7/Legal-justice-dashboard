// backend/server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// -------- CORS SETUP FOR /api ROUTES --------
const corsOptions = {
  origin: process.env.FRONTEND_URL,          // e.g. https://legal-dashboard-frontend.onrender.com
  credentials: true,                         // allow cookies/auth headers
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
};

// Enable CORS and preflight for all /api/* routes
app.use("/api", cors(corsOptions));
app.options("/api/*", cors(corsOptions));     // explicit preflight handling

// -------- BODY PARSING MIDDLEWARE --------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- MONGODB CONNECTION --------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// -------- STATIC FRONTEND SETUP --------
const clientBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(clientBuildPath));

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

// -------- SPA FALLBACK FOR CLIENT-SIDE ROUTING --------
app.get("*", (req, res, next) => {
  // Skip API and asset requests
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      console.error("⚠️ Failed to load index.html:", err);
      res.status(500).send("Frontend index.html not found.");
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

// -------- START SERVER --------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
