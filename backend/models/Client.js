import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) =>
          !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Must be a valid email address",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) =>
          !v || /^(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}$/.test(v),
        message: "Must be a valid phone number",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

clientSchema.index({ createdBy: 1 });

export default mongoose.model("Client", clientSchema);
