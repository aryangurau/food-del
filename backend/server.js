import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
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
  origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both frontend and admin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
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
    const categories = await getCategories();
    const categoryList = categories.map(cat => `• ${cat}`).join('\n');
    
    socket.emit("botMessage", 
      `Hello ${username}! 👋 I'm your food delivery assistant.\n\n` +
      `We offer delicious food in these categories:\n${categoryList}\n\n` +
      `I can help you with:\n` +
      `• Browsing menu by category\n` +
      `• Finding specific dishes\n` +
      `• Placing orders\n` +
      `• Tracking deliveries\n` +
      `• Special dietary requirements\n\n` +
      `What would you like to do today?`
    );
  });

  // Handle user messages
  socket.on("userMessage", async (message) => {
    const msg = message.toLowerCase();
    userContext.lastQuery = msg;

    // Handle menu-related queries
    if (msg.includes("menu") || msg.includes("food") || msg.includes("what") || msg.includes("eat")) {
      const categories = await getCategories();
      let response = "Here's our menu by category:\n\n";
      
      for (const category of categories) {
        const items = await getMenuItems(category);
        response += `${category}:\n`;
        items.forEach(item => {
          response += `• ${item.name} - ${formatPrice(item.price)}\n   ${item.description}\n`;
        });
        response += "\n";
      }
      
      response += "Would you like to:\n" +
                 "1. Know more about any specific dish?\n" +
                 "2. Filter by category?\n" +
                 "3. Place an order?\n" +
                 "Just let me know!";
      
      socket.emit("botMessage", response);
      userContext.currentStep = "menu_browsing";
    }

    // Handle category-specific queries
    else if (msg.includes("show") || msg.includes("list") || msg.includes("what")) {
      const categories = await getCategories();
      const matchingCategory = categories.find(cat => 
        msg.includes(cat.toLowerCase())
      );

      if (matchingCategory) {
        const items = await getMenuItems(matchingCategory);
        let response = `Here are our ${matchingCategory} items:\n\n`;
        items.forEach(item => {
          response += `• ${item.name} - ${formatPrice(item.price)}\n   ${item.description}\n\n`;
        });
        response += "Would you like to order any of these items?";
        
        socket.emit("botMessage", response);
        userContext.lastCategory = matchingCategory;
        userContext.currentStep = "category_browsing";
      }
    }

    // Handle specific food item queries
    else if (userContext.currentStep === "menu_browsing" || msg.includes("about")) {
      const searchResults = await searchFoodItems(msg);
      if (searchResults.length > 0) {
        let response = "Here's what I found:\n\n";
        searchResults.forEach(item => {
          response += `${item.name} - ${formatPrice(item.price)}\n` +
                     `Description: ${item.description}\n` +
                     `Category: ${item.category}\n\n`;
        });
        response += "Would you like to order any of these items?";
        socket.emit("botMessage", response);
      } else {
        socket.emit("botMessage", 
          "I couldn't find any items matching your query. Would you like to:\n" +
          "1. See the full menu?\n" +
          "2. Browse by category?\n" +
          "3. Try a different search?"
        );
      }
    }

    // Handle order-related queries
    else if (msg.includes("order") || msg.includes("buy") || msg.includes("get")) {
      if (msg.includes("status") || msg.includes("track")) {
        try {
          const order = await orderModel.findOne({ userId: userContext.userId }).sort({ createdAt: -1 });
          if (order) {
            socket.emit("botMessage", 
              `Your latest order #${order._id} is currently ${order.status}.\n` +
              `${order.status === 'preparing' ? 'The restaurant is preparing your food.' :
                order.status === 'on the way' ? 'Your food is on its way!' :
                order.status === 'delivered' ? 'Hope you enjoyed your meal!' : ''}`
            );
          } else {
            socket.emit("botMessage", "I couldn't find any recent orders. Would you like to place a new order?");
          }
        } catch (error) {
          socket.emit("botMessage", "I'm having trouble checking your order status. Please try again later.");
        }
      } else {
        const categories = await getCategories();
        const categoryList = categories.map(cat => `• ${cat}`).join('\n');
        socket.emit("botMessage", 
          `I'll help you place an order! What type of food are you in the mood for?\n\n` +
          `Our categories:\n${categoryList}\n\n` +
          `Just tell me which category interests you, and I'll show you the available items!`
        );
        userContext.currentStep = "order_category_selection";
      }
    }

    // Handle help or confusion
    else if (msg.includes("help") || msg.includes("how") || msg.includes("confused")) {
      socket.emit("botMessage",
        "I'm here to help! You can:\n\n" +
        "• View the full menu by saying 'show menu'\n" +
        "• Browse specific categories like 'show Italian food'\n" +
        "• Ask about a specific dish\n" +
        "• Track your order status\n" +
        "• Place a new order\n\n" +
        "What would you like to do?"
      );
    }

    // Handle greetings
    else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
      const categories = await getCategories();
      const categoryList = categories.map(cat => `• ${cat}`).join('\n');
      socket.emit("botMessage",
        `Hi there! 👋 We have these delicious categories:\n\n${categoryList}\n\n` +
        `What would you like to try today?`
      );
    }

    // Handle goodbyes
    else if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("thank")) {
      socket.emit("botMessage", "Thank you for chatting! If you need anything else, I'm here to help. Enjoy your meal! 😊");
    }

    // Handle unknown queries
    else {
      socket.emit("botMessage",
        "I'm not sure what you're looking for. You can:\n" +
        "• View our menu\n" +
        "• Browse by category\n" +
        "• Search for specific dishes\n" +
        "• Track your order\n\n" +
        "How can I help you today?"
      );
    }
  });

  // Handle user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected");
    userContext = null;
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
