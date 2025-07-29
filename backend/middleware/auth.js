// backend/middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes — verifies JWT and attaches user to req.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user (excluding password) and attach to request
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // No token provided
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
