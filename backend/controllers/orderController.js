import dotenv from "dotenv";
dotenv.config();
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { sendEmail } from "../utils/mailer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173"; 
  try {
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

    // Create line items for Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: "USD",
        product_data: { 
          name: item.name,
          metadata: {
            productId: item._id
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery charge
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

    // Create metadata
    const metadata = {
      userId: userId.toString(),
      items: JSON.stringify(items.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))),
      address: JSON.stringify(address),
      totalAmount: amount + 2 // Add delivery charge
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?success=false`,
      metadata: metadata,
      payment_intent_data: {
        metadata: metadata
      }
    });

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order"
    });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      console.error("No session_id provided in query");
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    console.log("Retrieving session:", session_id);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Session retrieved:", session.payment_status);
    
    if (!session) {
      console.error("No session found for ID:", session_id);
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    if (session.payment_status === "paid") {
      try {
        // Get metadata from session first, fallback to payment intent
        let metadata = session.metadata;
        
        if (!metadata || !metadata.items || !metadata.address || !metadata.userId || !metadata.totalAmount) {
          console.log("Metadata not found in session, checking payment intent...");
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          metadata = paymentIntent.metadata;
        }

        if (!metadata || !metadata.items || !metadata.address || !metadata.userId || !metadata.totalAmount) {
          console.error("Missing metadata in both session and payment intent");
          return res.status(400).json({
            success: false,
            message: "Missing order information in payment"
          });
        }

        console.log("Processing order with metadata:", metadata);
        const items = JSON.parse(metadata.items);
        const address = JSON.parse(metadata.address);
        const userId = metadata.userId;
        const totalAmount = parseFloat(metadata.totalAmount);

        // Create order
        const order = new orderModel({
          userId,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount,
          address,
          paymentMethod: "stripe",
          status: "preparing",
          paymentStatus: "completed"
        });

        console.log("Saving order for user:", userId);
        await order.save();

        // Update user's order history
        console.log("Updating user order history");
        await userModel.findByIdAndUpdate(
          userId,
          { $push: { orders: order._id } }
        );

        return res.json({
          success: true,
          message: "Payment verified and order created",
          orderId: order._id
        });
      } catch (error) {
        console.error("Error processing payment intent:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing payment details"
        });
      }
    } else {
      console.log("Payment not completed. Status:", session.payment_status);
      return res.status(400).json({
        success: false,
        message: "Payment not completed"
      });
    }
  } catch (error) {
    console.error("Verify order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify order"
    });
  }
};

const placeInstantOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.user._id;

    // Create order directly
    const order = new orderModel({
      userId,
      items: items.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: amount + 2, // Add delivery charge
      address,
      paymentMethod,
      status: "preparing",
      paymentStatus: paymentMethod === 'cash' ? "pending" : "completed" // Set pending for COD
    });

    await order.save();

    // Update user's order history
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { orders: order._id } }
    );

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("Place instant order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order"
    });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list orders"
    });
  }
};

const getOrderStatusEmailContent = (order, status) => {
  const itemsList = order.items.map(item => 
    `<li>${item.name} × ${item.quantity} - ₹${item.price}</li>`
  ).join('');

  let statusMessage = '';
  switch(status.toLowerCase()) {
    case 'preparing':
      statusMessage = 'Your order is being prepared with care in our kitchen.';
      break;
    case 'on the way':
      statusMessage = 'Your delicious food is on its way to you!';
      break;
    case 'delivered':
      statusMessage = 'Your order has been delivered. Enjoy your meal!';
      break;
    case 'cancelled':
      statusMessage = 'Your order has been cancelled.';
      break;
    default:
      statusMessage = `Your order status has been updated to: ${status}`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #e65100;">Order Status Update</h2>
      <p style="font-size: 16px; color: #333;">${statusMessage}</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <h3 style="color: #333;">Order Details</h3>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-5)}</p>
        <p><strong>Items:</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          ${itemsList}
        </ul>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <h3 style="color: #333;">Delivery Address</h3>
        <p>${order.address.name}</p>
        <p>${order.address.street}</p>
        <p>${order.address.city}, ${order.address.state}</p>
        <p>${order.address.country} - ${order.address.zipCode}</p>
        <p>Phone: ${order.address.phone}</p>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>Thank you for placing your order with Pathao Khaja!</p>
        <p style="font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>
    </div>
  `;
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    const order = await orderModel.findById(orderId)
      .populate('userId', 'email')
      .populate('items.productId');

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    // Send email notification
    if (order.userId && order.userId.email) {
      try {
        await sendEmail({
          to: order.userId.email,
          subject: `Order Status Update - ${status}`,
          htmlMessage: getOrderStatusEmailContent(order, status)
        });
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Don't return error response as the status update was successful
      }
    }

    res.json({
      success: true,
      message: "Order status updated"
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    order.paymentStatus = status;
    await order.save();

    res.json({
      success: true,
      message: "Payment status updated"
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status"
    });
  }
};

export { placeOrder, placeInstantOrder, verifyOrder, userOrders, listOrders, updateStatus, updatePaymentStatus };
