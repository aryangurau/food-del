import express from "express";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import LoyaltyTransaction from "../models/loyaltyTransactionModel.js";
import LoyaltyReward from "../models/loyaltyRewardModel.js";
import axios from 'axios';
import { sendEmail } from "../utils/mailer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to handle loyalty points
const handleLoyaltyPoints = async (userId, orderId, totalAmount, usePoints) => {
  try {
    // If using points, deduct 300 points and don't add new points
    if (usePoints) {
      // Check if user has enough points
      const transactions = await LoyaltyTransaction.find({ userId });
      const currentPoints = transactions.reduce((acc, curr) => 
        curr.type === 'earn' ? acc + curr.points : acc - curr.points, 0);

      if (currentPoints < 300) {
        throw new Error('Insufficient loyalty points');
      }

      // Deduct 300 points
      const pointsTransaction = new LoyaltyTransaction({
        userId,
        orderId,
        points: 300,
        type: 'redeem',
        source: 'redemption',
        description: 'Redeemed 300 points for order discount'
      });
      await pointsTransaction.save();
      return; // Don't add new points when redeeming
    }

    // Calculate points (10 points per 100 rupees)
    const pointsEarned = Math.floor((totalAmount / 100) * 10);
    if (pointsEarned > 0) {
      const earnTransaction = new LoyaltyTransaction({
        userId,
        orderId,
        points: pointsEarned,
        type: 'earn',
        source: 'order',
        description: `Earned ${pointsEarned} points from order`
      });
      await earnTransaction.save();
    }
  } catch (error) {
    console.error("Error handling loyalty points:", error);
    throw error; // Throw error to handle in order processing
  }
};

// Helper function to verify payment status for Nepalese payment gateways
const verifyNepalPayment = async (paymentMethod, transactionId, amount) => {
  try {
    switch (paymentMethod) {
      case 'khalti':
        // Verify Khalti payment
        const khaltiResponse = await axios.post(
          'https://khalti.com/api/v2/payment/verify/',
          {
            token: transactionId,
            amount: amount
          },
          {
            headers: {
              'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
            }
          }
        );
        return khaltiResponse.data.state === 'Completed';

      case 'esewa':
        // Verify eSewa payment
        const esewaResponse = await axios.get(
          `https://esewa.com.np/api/v1/transaction/${transactionId}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.ESEWA_SECRET_KEY}`
            }
          }
        );
        return esewaResponse.data.status === 'SUCCESS';

      case 'fonepay':
        // Verify FonePay payment
        const fonepayResponse = await axios.get(
          `https://fonepay.com/api/v1/verify/${transactionId}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.FONEPAY_SECRET_KEY}`
            }
          }
        );
        return fonepayResponse.data.status === 'Completed';

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error verifying ${paymentMethod} payment:`, error);
    return false;
  }
};

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173"; 
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { items, amount, address, usePoints, paymentMethod } = req.body;
    const userId = req.user._id;

    // For Stripe payments, don't create the order yet
    if (paymentMethod === 'stripe') {
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
        totalAmount: amount + 2, // Add delivery charge
        usePoints: usePoints ? 'true' : 'false'
      };

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&session_id={CHECKOUT_SESSION_ID}&payment_method=stripe`,
        cancel_url: `${frontend_url}/verify?success=false&payment_method=stripe`,
        metadata: metadata,
        payment_intent_data: {
          metadata: metadata
        }
      });

      return res.json({
        success: true,
        url: session.url
      });
    }

    // For non-Stripe payments, create the order immediately
    const order = new orderModel({
      userId,
      items: items.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        paymentMethod:"esewa",

      })),
      totalAmount: amount,
      address,
      paymentMethod:"esewa",
      status: paymentMethod === 'esewa' ? 'preparing' : 'pending',
      paymentStatus: paymentMethod === 'esewa' ? 'pending' : 'pending',
      usePoints
    });

    await order.save();

    // Handle different payment methods
    switch (paymentMethod) {
      case 'khalti':
        return res.json({
          success: true,
          orderId: order._id,
          paymentUrl: `https://khalti.com/payment/${order._id}`,
          publicKey: process.env.KHALTI_PUBLIC_KEY
        });

      case 'esewa':
        return res.json({
          success: true,
          orderId: order._id,
          paymentUrl: `https://esewa.com.np/pay/${order._id}`,
          merchantCode: process.env.ESEWA_MERCHANT_CODE
        });

      case 'fonepay':
        return res.json({
          success: true,
          orderId: order._id,
          paymentUrl: `https://fonepay.com/pay/${order._id}`,
          merchantCode: process.env.FONEPAY_MERCHANT_CODE
        });

      case 'cash':
        return res.json({
          success: true,
          orderId: order._id,
          message: "Order placed successfully"
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid payment method"
        });
    }
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to place order"
    });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { session_id, payment_method } = req.query;
    
    // Handle Stripe payments
    if (payment_method === 'stripe') {
      if (!session_id) {
        console.error("No session_id provided for Stripe payment");
        return res.status(400).json({
          success: false,
          message: "Session ID is required for Stripe payment"
        });
      }

      // Check if an order with this session ID already exists
      const existingOrder = await orderModel.findOne({ sessionId: session_id });
      if (existingOrder) {
        console.log("Order already exists for session:", session_id);
        return res.json({
          success: true,
          message: "Order already processed",
          orderId: existingOrder._id
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
          const usePoints = metadata.usePoints === 'true';

          // Create order with session ID
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
            status: "preparing", // Set to preparing since payment is confirmed
            paymentStatus: "completed",
            sessionId: session_id,
            usePoints
          });

          console.log("Saving order for user:", userId);
          await order.save();

          // Handle loyalty points
          await handleLoyaltyPoints(userId, order._id, totalAmount, usePoints);

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
    }

    // For other payment methods (khalti, esewa, fonepay)
    // Just update the existing order's payment status
    const { transaction_id } = req.query;
    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }

    const pendingOrder = await orderModel.findOne({ 
      transactionId: transaction_id,
      paymentMethod: payment_method
    });

    if (!pendingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const isPaymentVerified = await verifyNepalPayment(payment_method, transaction_id, pendingOrder.totalAmount);
    
    if (!isPaymentVerified) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // Update order status
    pendingOrder.paymentStatus = "completed";
    pendingOrder.status = "preparing"; // Set to preparing since payment is verified
    await pendingOrder.save();

    // Handle loyalty points
    await handleLoyaltyPoints(
      pendingOrder.userId, 
      pendingOrder._id, 
      pendingOrder.totalAmount, 
      pendingOrder.usePoints
    );

    return res.json({
      success: true,
      message: "Payment verified and order updated",
      orderId: pendingOrder._id
    });
  } catch (error) {
    console.error("Verify order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify order"
    });
  }
};

const placeInstantOrder = async (req, res) => {
  try {
    const { items, amount, address ,paymentMethod, usePoints} = req.body;
    
    const userId = req.user._id;
// Determine payment status based on payment method
let paymentStatus = "pending"; // default status
    
// Set payment status for different payment methods
if (["khalti", "esewa", "fonepay"].includes(paymentMethod)) {
  paymentStatus = "completed";
} else if (paymentMethod === "COD") {
  paymentStatus = "pending";
}

    // Create the order
    const order = new orderModel({
      userId,
      items: items.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        usePoints: usePoints || false
      })),
      totalAmount: amount,
      address,
      paymentMethod,
      status: "preparing",
      paymentStatus,
    });

    await order.save();

     // Handle loyalty points
     await handleLoyaltyPoints(userId, order._id, amount, usePoints);


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

// Helper function to handle refund for different payment methods
const initiateRefund = async (order) => {
  try {
    const { paymentMethod, transactionId, totalAmount } = order;
    let refundSuccess = false;
    
    switch(paymentMethod) {
      case 'stripe':
        try{
        const refund = await stripe.refunds.create({
          payment_intent: transactionId,
          amount: totalAmount * 100 // Stripe expects amount in cents
        });
        refundSuccess = refund.status === 'succeeded';
      }catch (error) {
        console.error('Stripe refund error:', error);
        throw error;
      }
      break;

      case 'khalti':
        // Initiate Khalti refund
        try {
        const khaltiResponse = await axios.post(
          'https://khalti.com/api/v2/refund/',
          {
            token: transactionId,
            amount: totalAmount
          },
          {
            headers: {
              'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
            }
          }
        );
        refundSuccess = khaltiResponse.data.state === 'Complete';
      } catch (error) {
        console.error('Khalti refund error:', error);
        throw error;
      }
      break;

      case 'esewa':
        try {
          const esewaResponse = await axios.post(
            'https://esewa.com.np/api/v1/refund',
            {
              transactionId,
              amount: totalAmount
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.ESEWA_SECRET_KEY}`
              }
            }
          );
          refundSuccess = esewaResponse.data.success;
        } catch (error) {
          console.error('eSewa refund error:', error);
          throw error;
        }
        break;

      case 'fonepay':
        try {
          const fonepayResponse = await axios.post(
            'https://fonepay.com/api/v1/refund',
            {
              transactionId,
              amount: totalAmount
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.FONEPAY_SECRET_KEY}`
              }
            }
          );
          refundSuccess = fonepayResponse.data.success;
        } catch (error) {
          console.error('FonePay refund error:', error);
          throw error;
        }
        break;

      case 'cash':
        // For cash payments, mark as refunded and handle manually
        refundSuccess = true;
        break;

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

     // If refund was successful, update order statistics
     if (refundSuccess) {
      try {
        // Update daily revenue stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const stats = await orderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: today },
              status: { $ne: 'cancelled' }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              totalOrders: { $sum: 1 },
              refundedAmount: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'cancelled'] },
                    '$totalAmount',
                    0
                  ]
                }
              }
            }
          }
        ]);

        // Store or update the daily stats
        await orderModel.updateOne(
          { date: today },
          {
            $inc: {
              refundedAmount: order.totalAmount,
              totalRevenue: -order.totalAmount,
              cancelledOrders: 1
            }
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error updating revenue stats:', error);
        // Don't throw error here as the refund was successful
      }
    }

    return refundSuccess;
  } catch (error) {
    console.error('Error initiating refund:', error);
    throw error;
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // Find the order and populate user details
    const order = await orderModel.findById(orderId).populate('userId', 'email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    // Check if the order belongs to the user
    if (order.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order"
      });
    }

    // Check if order can be cancelled (within 5 minutes and not already cancelled/delivered)
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = (now - orderTime) / (1000 * 60);

    if (diffInMinutes > 5) {
      return res.status(400).json({
        success: false,
        message: "Orders can only be cancelled within 5 minutes of placing"
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled"
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a delivered order"
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    
   // Handle payment refund if payment was completed
   if (order.paymentStatus === 'completed') {
    try {
      const refundSuccess = await initiateRefund(order);
      if (refundSuccess) {
        order.refundStatus = 'completed';
        order.refundedAt = new Date();
        order.refundedAmount = order.totalAmount;
      } else {
        order.refundStatus = 'failed';
      }
    } catch (refundError) {
      console.error('Failed to process refund:', refundError);
      order.refundStatus = 'failed';
    }
  }

  await order.save();

    // Get user's email from either order.address or the populated user document
    const userEmail = order.address?.email || order.userId.email;

    // Send cancellation email
    if (userEmail) {
      const emailContent = getOrderStatusEmailContent(order, 'cancelled');
      try {
        await sendEmail({
          to: userEmail,
          subject: 'Order Cancelled',
          htmlMessage: emailContent
        });
        console.log('Cancellation email sent successfully');
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    } else {
      console.error("No email address found for order:", orderId);
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        ...order.toObject(),
        refundInitiated: order.paymentStatus === 'completed',
        refundStatus: order.refundStatus,
        refundedAmount: order.refundedAmount
      }
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message
    });
  }
};


export { placeOrder, placeInstantOrder, verifyOrder, userOrders, listOrders, updateStatus, updatePaymentStatus, cancelOrder };
