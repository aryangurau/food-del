import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin privileges required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuth;
