// backend/models/Case.js

import mongoose from "mongoose"

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Done"],
      default: "Pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ Updated documents field (now an array of file objects, not just strings)
    documents: [
      {
        filename: String,
        url: String,
        mimetype: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],

    // ✅ Existing comments structure remains
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const Case = mongoose.model("Case", caseSchema)
export default Case
