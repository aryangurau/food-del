const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Ensure token is present in Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
          success: false,
          message: "Not Authorized, please log in again",
      });
  }

  const token = authHeader.split(" ")[1];

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.body.userId = decoded.id; // Attach user ID to request
      next();
  } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
          success: false,
          message: "Invalid or expired token, please log in again",
      });
  }
};

export default authMiddleware;

