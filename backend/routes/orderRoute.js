import express from "express";
import authMiddleware from "../middleware/auth.js";
import orderModel from "../models/orderModel.js";
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

// Track order status
orderRouter.post("/track", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Check if the order belongs to the requesting user
    if (order.userId !== req.body.userId) {
      return res.json({ success: false, message: "Unauthorized to track this order" });
    }

    res.json({ 
      success: true, 
      status: order.status,
      updatedAt: order.updatedAt 
    });
  } catch (error) {
    console.error("Track order error:", error);
    res.json({ success: false, message: "Failed to track order" });
  }
});

export default orderRouter;
