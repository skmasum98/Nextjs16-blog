import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401); // Unauthorized
        throw new Error("Not authorized, user not found");
      }

      next(); // Move to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401); // Unauthorized
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401); // Unauthorized
    throw new Error("Not authorized, no token");
  }
});

// Middleware for Admin-only access (NFR-4.1.1)
const admin = (req, res, next) => {
  // Check if the user is authenticated and has the 'Admin' role
  if (req.user && req.user.role === "Admin") {
    next(); // User is Admin, continue
  } else {
    res.status(403); // Forbidden
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin };
