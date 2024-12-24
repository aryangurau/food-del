import dotenv from "dotenv";
dotenv.config();
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  try {
    console.log("Request body:", req.body);

    // Creating new order
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    console.log("Attempting to save new order:", newOrder);

    // Saving order in the database
    await newOrder.save();
    console.log("Order successfully saved to the database:", newOrder);

    // Cleaning user's cart data
    const user = await userModel.findByIdAndUpdate(req.body.userId, {
      cartData: {},
    });
    console.log("User cart cleared for user:", req.body.userId);

    // Stripe payment
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "USD",
        product_data: { name: item.name },
        unit_amount: item.price * 100, // Example conversion, might need adjustments
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "USD",
        product_data: { name: "Delivery Charges" },
        unit_amount: 2 * 100, // Delivery charge, might need adjustments
      },
      quantity: 1,
    });

    console.log("Line items for Stripe payment:", line_items);
    const success_url = `${frontend_url}/verify?success=true&orderId=${newOrder._id}`;
    const cancel_url = `${frontend_url}/verify?success=false&orderId=${newOrder._id}`;
    console.log("Success URL:", success_url);
    console.log("Cancel URL:", cancel_url);

    // Creating Stripe session
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    // Sending session URL to the frontend
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Error in placeOrder function:", error.message);
    res.json({ success: false, message: "Error in order controller" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req?.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//listing orders for admin panel

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error from list orders" });
  }
};

//api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.josn({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
