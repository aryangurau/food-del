import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { sendEmail } from "../utils/mailer.js";
import crypto from 'crypto';

import { genOTP } from "../utils/token.js";

const createToken = (id, name) => {
  const token = jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: "3d" });
  console.log("Created Token:", token);  // Verify the structure of the token
  return token;
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Create token with user id and name
    const token = createToken(user._id, user.name);

    // Save token in the database
    await userModel.findByIdAndUpdate(user._id, { token });

    // Send token and user info to frontend
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in controller" });
  }
};

//register user with email sending
const registerUser = async (req, res) => {
  const { name, password, email, phone } = req.body;
  try {
    // Checking if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User Already Registered" });
    }

    // Validate email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Validate phone number (should be 10-15 digits with optional country code)
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return res.json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create OTP for email verification
    // const otp = genOTP();

    // Create new user
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Save user
    await user.save();

    // Send verification email
    const htmlMessage = `
      <h2>Welcome to Food Delivery</h2>
      <p>Hi ${name},</p>
      <p>Start placing orders now!</p>
     
    `;

    await sendEmail({
      to: email,
      subject: "Registration",
      htmlMessage,
    });

    res.json({
      success: true,
      message: "Registration successful! Please check your email for verification.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error in controller" });
  }
};

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await userModel.countDocuments();
    const users = await userModel
      .find({}, { password: 0, token: 0 }) // Exclude sensitive data
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching users" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error deleting user" });
  }
};

// Update user status (block/unblock)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;
    
    const user = await userModel.findByIdAndUpdate(
      id,
      { blocked },
      { new: true }
    );
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating user status" });
  }
};


// Forgot password functionality
const forgotPassword = async (req, res) => {
  try {
    console.log('Forgot password request received:', req.body);
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      console.log('User not found for email:', email);

      return res.status(404).json({
        success: false,
        message: "User with this email doesn't exist",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const message = `
      You requested a password reset. Please click on the link below to reset your password:
      \n\n${resetUrl}\n\n
      If you didn't request this, please ignore this email.
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        htmlMessage:`
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to email',
      });
    } catch (error) {
      console.error('Forgot password error:', error);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Reset password functionality
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with the reset token and check if token is expired
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



export { loginUser, registerUser, getUsers, deleteUser, updateUserStatus , forgotPassword, resetPassword};
