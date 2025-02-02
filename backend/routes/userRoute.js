import express from "express";
import { 
  loginUser, 
  registerUser, 
  getUsers, 
  deleteUser, 
  updateUserStatus,
  forgotPassword,
  resetPassword,
  verifyOTP,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list", getUsers);
userRouter.delete("/:id", deleteUser);
userRouter.put("/:id/status", updateUserStatus);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post('/verify-otp', verifyOTP);

export default userRouter;
