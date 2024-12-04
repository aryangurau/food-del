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
      return res.json({ success: false, message: "User Doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in controller" });
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};
//register user with email sending
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    //checking if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User Already Registered" });
    }

    //validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "please enter strong password",
      });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generating OTP for email verification
    const otp = genOTP();

    // Saving the new user
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    // Sending the OTP email
    const htmlMessage = `
     <h1>Welcome to Pathao Khaja!</h1>
     <p>Hello ${name},</p>
     <p>Thank you for registering. Start placing your order:</p>
    
     <p>If you didn't request this, please ignore this email.</p>
   `;

    await sendEmail({
      to: email,
      subject: "new user",
      htmlMessage,
    });

    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in controller" });
  }
};

export { loginUser, registerUser };
