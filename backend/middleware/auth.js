import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // --- THIS IS THE FIX ---
    // 1. Use 'decoded.id' to match how the token was signed.
    // 2. Use 'req.role' to match what the route handlers expect.
    req.userId = decoded.id; 
    req.role = decoded.role;
    // --- END OF FIX ---

    next();
  } catch (err) {
    // If the token is expired or invalid, clear the cookie and send an error
    res.clearCookie("token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
