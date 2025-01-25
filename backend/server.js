import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";
import { Server } from "socket.io";
import http from "http";
import foodModel from "./models/foodModel.js";
import orderModel from "./models/orderModel.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server for socket support
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// DB connection
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: corsOptions
});

// Socket.IO for chatbot
io.on("connection", (socket) => {
  console.log("User connected via Socket.IO");
  let userContext = {
    currentStep: null,
    orderInProgress: null,
    selectedItems: [],
    lastQuery: null,
    userId: null,
    lastCategory: null
  };

  // Helper function to get menu items
  const getMenuItems = async (category = null) => {
    try {
      const query = category ? { category } : {};
      const foods = await foodModel.find(query);
      return foods;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  // Helper function to get categories
  const getCategories = async () => {
    try {
      const foods = await foodModel.find({});
      const categories = [...new Set(foods.map(food => food.category))];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  // Helper function to search food items
  const searchFoodItems = async (searchTerm) => {
    try {
      const foods = await foodModel.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      return foods;
    } catch (error) {
      console.error('Error searching food items:', error);
      return [];
    }
  };

  // Greet logged-in users
  socket.on("userLoggedIn", async (username, userId) => {
    userContext.username = username;
    userContext.userId = userId;
    const greeting = `Hello ${username}! 👋 How can I help you today?\n\nYou can:\n• View our menu\n• Search for items\n• Track your order\n• Get recommendations`;
    socket.emit("botMessage", greeting);
  });

  socket.on("userMessage", async (message) => {
    const msg = message.toLowerCase();
    userContext.lastQuery = msg;

    if (msg.includes("menu")) {
      const categories = await getCategories();
      const categoryList = categories.map(cat => `• ${cat}`).join('\n');
      socket.emit("botMessage", 
        `Here are our menu categories:\n\n${categoryList}\n\nWhich category would you like to explore?`);
      userContext.currentStep = 'menu';
    }
    else if (msg.includes("search")) {
      socket.emit("botMessage", 
        "What kind of food are you looking for? You can describe the dish or cuisine you're interested in.");
      userContext.currentStep = 'search';
    }
    else if (msg.includes("track")) {
      if (userContext.userId) {
        try {
          const orders = await orderModel.find({ userId: userContext.userId }).sort({ date: -1 }).limit(1);
          if (orders.length > 0) {
            const latestOrder = orders[0];
            socket.emit("botMessage", 
              `Your latest order status is: ${latestOrder.status}\n\nOrder details:\n${latestOrder.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}`);
          } else {
            socket.emit("botMessage", "I couldn't find any recent orders for you.");
          }
        } catch (error) {
          console.error('Error tracking order:', error);
          socket.emit("botMessage", "Sorry, I encountered an error while tracking your order.");
        }
      } else {
        socket.emit("botMessage", "Please log in to track your orders.");
      }
    }
    else if (msg.includes("recommend")) {
      try {
        const foods = await foodModel.find().limit(3);
        const recommendations = foods.map(food => 
          `• ${food.name} - ${formatPrice(food.price)}\n  ${food.description}`
        ).join('\n\n');
        socket.emit("botMessage", 
          `Here are some popular items you might like:\n\n${recommendations}`);
      } catch (error) {
        console.error('Error getting recommendations:', error);
        socket.emit("botMessage", "Sorry, I couldn't fetch recommendations at the moment.");
      }
    }
    else if (userContext.currentStep === 'menu' && msg) {
      const foods = await getMenuItems(msg);
      if (foods.length > 0) {
        const menuItems = foods.map(food => 
          `• ${food.name} - ${formatPrice(food.price)}\n  ${food.description}`
        ).join('\n\n');
        socket.emit("botMessage", 
          `Here are the items in ${msg}:\n\n${menuItems}\n\nWould you like to know more about any specific item?`);
        userContext.lastCategory = msg;
      } else {
        const categories = await getCategories();
        if (categories.some(cat => cat.toLowerCase() === msg)) {
          socket.emit("botMessage", "Sorry, there are no items in this category at the moment.");
        } else {
          socket.emit("botMessage", "I couldn't find that category. Please try another one.");
        }
      }
    }
    else if (userContext.currentStep === 'search' && msg) {
      const searchResults = await searchFoodItems(msg);
      if (searchResults.length > 0) {
        const results = searchResults.map(food => 
          `• ${food.name} - ${formatPrice(food.price)}\n  ${food.description}`
        ).join('\n\n');
        socket.emit("botMessage", 
          `Here's what I found:\n\n${results}\n\nWould you like to know more about any of these items?`);
      } else {
        socket.emit("botMessage", 
          "I couldn't find any items matching your search. Would you like to try different keywords?");
      }
    }
    else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
      const categories = await getCategories();
      const categoryList = categories.map(cat => `• ${cat}`).join('\n');
      socket.emit("botMessage",
        `Hi there! 👋 We have these delicious categories:\n\n${categoryList}\n\n` +
        `What would you like to explore?`);
    }
    else {
      socket.emit("botMessage", 
        "I'm here to help! You can:\n• View our menu\n• Search for items\n• Track your order\n• Get recommendations");
    }
  });

  // Handle user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected");
    userContext = {
      currentStep: null,
      orderInProgress: null,
      selectedItems: [],
      lastQuery: null,
      userId: null
    };
  });
});

// Start the server using the HTTP server instance
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
