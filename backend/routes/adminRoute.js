import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

const adminRouter = express.Router();

// Debug middleware
adminRouter.use((req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.path}`);
  next();
});

// Public routes
adminRouter.post("/login", (req, res, next) => {
  console.log("Login attempt with:", { email: req.body.email });
  adminLogin(req, res, next);
});

// Protected routes
adminRouter.use(adminAuth);

// Dashboard data endpoints
adminRouter.get("/dashboard", async (req, res) => {
  try {
    const [orders, foods, users] = await Promise.all([
      orderModel.find(),
      foodModel.find(),
      userModel.find()
    ]);

    const dashboardData = {
      totalDishes: foods.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      totalOrders: orders.length,
      delivered: orders.filter(o => o.status === "completed").length,
      totalSales: orders.reduce((sum, order) => sum + (order.amount || 0), 0),
      totalUsers: users.length,
      recentOrders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
});

// Food management endpoints
adminRouter.get("/food/list", async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Food list error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch food list" });
  }
});

// Order management endpoints
adminRouter.get("/orders", async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Orders list error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// User management endpoints
adminRouter.get("/users", async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Users list error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

export default adminRouter;
