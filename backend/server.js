// backend/server.js

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── 1️⃣ Global Middleware ────────────────────────────────────────────────────

// Parse JSON bodies
app.use(express.json())

// Parse cookies
app.use(cookieParser())

// Enable CORS for your frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ─── 2️⃣ Route Imports ────────────────────────────────────────────────────────

import authRoutes   from "./routes/auth.js"
import clientRoutes from "./routes/clients.js"
import caseRoutes   from "./routes/cases.js"       // includes file uploads via Multer
import taskRoutes   from "./routes/taskRoutes.js"
import reportsRoutes from "./routes/reports.js"
import userRoutes   from "./routes/userRoutes.js"

// ─── 3️⃣ Mount Routes ─────────────────────────────────────────────────────────

app.use("/api/auth",    authRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/cases",   caseRoutes)
app.use("/api/tasks",   taskRoutes)
app.use("/api/reports", reportsRoutes)
app.use("/api/users",   userRoutes)

// Health check
app.get("/", (req, res) => {
  res.send("Legal Justice Dashboard API is running")
})

// ─── 4️⃣ Connect to MongoDB & Start Server ────────────────────────────────────

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // no longer required in newer drivers
  })
  .then(() => {
    app.listen(5000, () => {
      console.log("✅ Server running at http://localhost:5000")
    })
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
  })
// ─── 5️⃣ Serve Frontend in Production ─────────────────────────────────────────