import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

// Create the transporter
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log("Email server is not working:", error);
  } else {
    console.log("Email server connected...");
  }
});

// Send email function
export const sendEmail = async ({ to, subject, htmlMessage }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Pathao Khaja" <${process.env.SMTP_EMAIL}>`, // Sender address
      to, // Recipient
      subject, // Email subject
      html: htmlMessage, // HTML message body
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
