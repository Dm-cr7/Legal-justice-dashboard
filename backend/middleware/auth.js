// backend/middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware:
 *   Only checks for Bearer token in Authorization header,
 *   verifies it, and attaches the user to req.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, token missing or malformed." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("🔒 Auth Error:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }
    return res
      .status(401)
      .json({ message: "Invalid token. Please authenticate again." });
  }
};
