import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Headers received:", req.headers);
    const authHeader = req.headers.authorization;
    console.log("Full authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Invalid auth header format. Header:", authHeader);
      return res.status(401).json({ 
        success: false, 
        message: "Authentication token is missing or invalid" 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log("Extracted token:", token);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token payload:", decoded);

      // Get fresh user data from database
      const user = await userModel.findById(decoded.id);
      console.log("Found user:", user ? "yes" : "no", user ? `(id: ${user._id})` : "");
      
      if (!user) {
        console.log("No user found for id:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      if (user.isBlocked) {
        console.log("User is blocked:", user._id);
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked"
        });
      }

      // Attach user to request
      req.user = {
        _id: user._id, 
        email: user.email,
        role: user.role
      };
      console.log("User attached to request:", req.user);
      next();
    } catch (error) {
      console.log("Token verification error:", error.message);
      console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default authMiddleware;