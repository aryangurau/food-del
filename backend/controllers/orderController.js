import dotenv from "dotenv";
dotenv.config();
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173"; 
  try {
    // Check if user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { items, amount, address } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!items || !amount || !address) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${[
          !items && 'items',
          !amount && 'amount',
          !address && 'address'
        ].filter(Boolean).join(', ')}`
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items must be a non-empty array"
      });
    }

    // Validate each item has required fields
    const itemValidation = items.every(item => {
      const hasRequiredFields = item._id && item.name && 
                              typeof item.price === 'number' && 
                              typeof item.quantity === 'number';
      return hasRequiredFields;
    });

    if (!itemValidation) {
      return res.status(400).json({
        success: false,
        message: "Each item must have _id, name, price, and quantity"
      });
    }

    // Validate address fields
    const requiredAddressFields = ['street', 'city', 'state', 'country', 'zipCode'];
    const missingAddressFields = requiredAddressFields.filter(field => !address[field]);
    
    if (missingAddressFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing address fields: ${missingAddressFields.join(', ')}`
      });
    }

    try {
      // Create Stripe session first to ensure it works
      const line_items = items.map((item) => ({
        price_data: {
          currency: "USD",
          product_data: { 
            name: `${item.name} (Qty: ${item.quantity})`
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      }));

      line_items.push({
        price_data: {
          currency: "USD",
          product_data: { 
            name: "Delivery Charges"
          },
          unit_amount: 200,
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontend_url}/cancel`,
        submit_type: 'pay',
        payment_intent_data: {
          metadata: {
            userId: userId.toString()
          }
        }
      });

      // If Stripe session is created successfully, save the order
      const newOrder = new orderModel({
        userId,
        items,
        amount,
        address,
        status: "pending",
        paymentStatus: "pending"
      });

      await newOrder.save();

      res.json({
        success: true,
        url: session.url,
        orderId: newOrder._id
      });

    } catch (stripeError) {
      console.error("Stripe session creation error:", stripeError);
      res.status(500).json({
        success: false,
        message: "Failed to create payment session"
      });
    }
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order"
    });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { success, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Get the userId from the payment intent metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    const userId = paymentIntent.metadata.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in payment metadata"
      });
    }

    // Find and update the pending order for this user
    const order = await orderModel.findOneAndUpdate(
      { userId, status: "pending" },
      { status: success ? "confirmed" : "failed" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      message: success ? "Payment verified successfully" : "Payment failed",
      order
    });
  } catch (error) {
    console.error("Verify order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment"
    });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const orders = await orderModel.find({ 
      userId: req.user._id 
    }).sort({ createdAt: -1 }); // Sort by newest first

    if (!orders) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders" 
    });
  }
};

//listing orders for admin panel

const listOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await orderModel.countDocuments({});
    const totalPages = Math.ceil(totalItems / limit);

    const orders = await orderModel.find({})
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders" 
    });
  }
};

//api for updating order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully"
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order"
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;
    
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order,
      message: "Payment status updated successfully"
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status"
    });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, updatePaymentStatus };
