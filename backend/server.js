// backend/server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";  // ← import cors

// 1. Load env vars
dotenv.config();

// 2. __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Create app
const app = express();

// 4. CORS: allow your Static Site origin
app.use(cors({
  origin: "https://legal-dashboard-frontend.onrender.com",
  credentials: true,   // allow cookies/auth headers
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
// handle preflight
app.options("*", cors());

// 5. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. API routes
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

// 7. Serve React build
const clientBuildPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(clientBuildPath));

// 8. SPA fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.includes(".")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"), err => {
    if (err) {
      console.error("⚠️ Failed to serve index.html:", err);
      res.status(500).send("Frontend not found");
    }
  });
});

// 9. Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// 10. Connect & start
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
