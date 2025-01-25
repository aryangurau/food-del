import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Debug middleware
adminRouter.use((req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.path}`);
  next();
});

adminRouter.post("/login", (req, res, next) => {
  console.log("Login attempt with:", { email: req.body.email });
  adminLogin(req, res, next);
});

export default adminRouter;
