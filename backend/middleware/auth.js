import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required. Please login." 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { 
        id: decoded.id,
        name: decoded.name 
      };
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token. Please login again." 
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during authentication" 
    });
  }
};

export default authMiddleware;