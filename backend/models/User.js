// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      select: false, // prevent returning it in queries
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["advocate", "paralegal"],
      default: "paralegal",
    },
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

// Add case-insensitive email uniqueness at DB level (if needed separately)
// You can run this once using a migration script
userSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare input password with hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
