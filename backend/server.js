// backend/server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// -------- SERVE STATIC ASSETS --------
// Adjust these paths if you use CRA (build/) or raw public/ during dev
const clientBuildPath = path.join(__dirname, "..", "frontend", "dist");
const clientPublicPath = path.join(__dirname, "..", "frontend", "public");

// First, serve anything from the build output (after `npm run build`)
app.use(express.static(clientBuildPath));

// Fallback to serving raw public/ files if not present in dist (optional)
app.use(express.static(clientPublicPath));

// -------- API ROUTES --------
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

// -------- CLIENT-SIDE ROUTING FALLBACK --------
app.get("/*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      // If build/index.html not found, fall back to public/index.html
      res.sendFile(path.join(clientPublicPath, "index.html"));
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
