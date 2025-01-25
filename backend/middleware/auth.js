import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token;
    console.log("Received token:", token ? "exists" : "missing");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication token is missing" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      // Get fresh user data from database
      const user = await userModel.findById(decoded.id);
      if (!user) {
        console.log("No user found for id:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "User not found"
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
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

export default authMiddleware;