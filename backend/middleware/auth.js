import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized login again" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Set user object
    req.body.userId = decoded.id; // Keep for backward compatibility
    next();
  } catch (error) {
    console.log(error);
    res.json({success:false, message:"Error"})
  }
};
export default authMiddleware;