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

// App config
const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server for socket support
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to allow requests from the frontend
  },
});

// Middleware
app.use(express.json());
app.use(cors());

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

// Socket.IO for chatbot
io.on("connection", (socket) => {
  console.log("User connected via Socket.IO");

  // Greet logged-in users
  socket.on("userLoggedIn", (username) => {
    socket.emit("botMessage", `Hello ${username}, how can I assist you with your food order?`);
  });

  // Handle user messages
  socket.on("userMessage", (message) => {
    if (message.toLowerCase().includes("menu")) {
      socket.emit("botMessage", "Here is today's menu:\n1. Pizza\n2. Burger\n3. Pasta");
    } else if (message.toLowerCase().includes("order")) {
      socket.emit("botMessage", "What would you like to order?");
    } else {
      socket.emit("botMessage", "I'm sorry, I didn't understand. Can you try again?");
    }
  });

  // Handle user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
