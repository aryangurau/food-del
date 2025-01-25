import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";

const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: "admin@foodapp.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = new userModel({
      name: "Admin",
      email: "admin@foodapp.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "admin",
      isActive: true
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@foodapp.com");
    console.log("Password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
