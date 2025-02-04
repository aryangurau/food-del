import express from "express";
import authMiddleware from "../middleware/auth.js";
import orderModel from "../models/orderModel.js";
import {
  listOrders,
  placeOrder,
  placeInstantOrder,
  updateStatus,
  userOrders,
  verifyOrder,
  cancelOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/place-instant", authMiddleware, placeInstantOrder);
orderRouter.get("/verify", verifyOrder); // Changed to GET since we're using query params
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/cancel", authMiddleware, cancelOrder);

// Track order status
orderRouter.post("/track", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Check if the order belongs to the requesting user
    if (order.userId.toString() !== req.user._id.toString()) {
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
