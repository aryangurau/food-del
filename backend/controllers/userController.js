import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { sendEmail } from "../utils/mailer.js";
import { genOTP } from "../utils/token.js";

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



const createToken = (id, name) => {
  const token = jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: "3d" });
  console.log("Created Token:", token);  // Verify the structure of the token
  return token;
};


//register user with email sending
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
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

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and generate token
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();

    const token = createToken(user._id, user.name);

    // Save token in the database
    await userModel.findByIdAndUpdate(user._id, { token });

    // Send OTP email
    const htmlMessage = `
      <h1>Welcome to Pathao Khaja!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for registering. Start placing your order:</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: email,
      subject: "New User Registration",
      htmlMessage,
    });

    // Respond with success message and token
    res.json({
      success: true,
      message: "Registration successful",
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


export { loginUser, registerUser };
