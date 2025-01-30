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

    // Debug logging
    console.log("Total orders found:", orders.length);
    console.log("Orders statuses:", orders.map(o => ({ 
      status: o.status, 
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount 
    })));

    const pendingOrders = orders.filter(o => {
      // Order is pending if:
      // 1. Order status is pending OR
      // 2. Payment is pending (for cash orders) OR
      // 3. Order is in initial state (preparing) and payment is not completed
      return (
        o.status === "pending" || 
        o.paymentStatus === "pending" ||
        (o.status === "preparing" && o.paymentStatus !== "completed")
      );
    });

    console.log("Pending orders count:", pendingOrders.length);
    console.log("Pending orders:", pendingOrders.map(o => ({
      id: o._id,
      status: o.status,
      paymentStatus: o.paymentStatus
    })));

    const dashboardData = {
      totalDishes: foods.length,
      pendingOrders: pendingOrders.length,
      totalOrders: orders.length,
      delivered: orders.filter(o => o.status === "delivered" && o.paymentStatus === "completed").length,
      totalSales: orders
        .filter(o => o.paymentStatus === "completed")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      totalUsers: users.length,
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };

    console.log("Dashboard data:", dashboardData);

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

adminRouter.put("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Order update error:", error);
    res.status(500).json({ success: false, message: "Failed to update order" });
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
