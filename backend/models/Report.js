import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: [true, "Associated case is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Report creator (user) is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Optional: Indexes for performance
reportSchema.index({ user: 1 });
reportSchema.index({ case: 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.model("Report", reportSchema);
