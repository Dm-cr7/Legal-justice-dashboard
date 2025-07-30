// backend/models/Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  description: String,
  case:     { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt:{ type: Date, default: Date.now }
});

const Report = mongoose.model("Report", ReportSchema);
export default Report;
