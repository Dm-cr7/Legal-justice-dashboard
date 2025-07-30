// backend/server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// 1. Load env vars
dotenv.config();

// 2. Debug: confirm FRONTEND_URL
console.log("🛠️ FRONTEND_URL:", process.env.FRONTEND_URL);

// 3. __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Create app
const app = express();

// 5. Global CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,    // https://legal-dashboard-frontend.onrender.com
  credentials: true,                   // allow cookies
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
};
app.use(cors(corsOptions));            // apply to all routes
app.options("*", cors(corsOptions));   // handle preflight for all

// 6. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 7. API routes
import authRoutes from "./routes/auth.js";
import caseRoutes from "./routes/cases.js";
import clientRoutes from "./routes/clients.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reports.js";
import userRoutes from "./routes/userRoutes.js";
import { protect } from "./middleware/auth.js";

app.use("/api/auth", authRoutes);
app.use("/api/cases", protect, caseRoutes);
app.use("/api/clients", protect, clientRoutes);
app.use("/api/tasks", protect, taskRoutes);
app.use("/api/reports", protect, reportRoutes);
app.use("/api/users", protect, userRoutes);

// 8. Serve static frontend
const clientBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(clientBuildPath));

// 9. SPA fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.includes(".")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"), err => {
    if (err) {
      console.error("⚠️ Failed to serve index.html:", err);
      res.status(500).send("Frontend not found");
    }
  });
});

// 10. Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// 11. Connect & start
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
