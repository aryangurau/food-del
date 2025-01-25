import express from "express";
import { 
  loginUser, 
  registerUser, 
  getUsers, 
  deleteUser, 
  updateUserStatus 
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list", getUsers);
userRouter.delete("/:id", deleteUser);
userRouter.put("/:id/status", updateUserStatus);

export default userRouter;
