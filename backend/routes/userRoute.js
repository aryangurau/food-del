import express from "express";
import { 
  loginUser, 
  registerUser, 
  getUsers, 
  deleteUser, 
  updateUserStatus,
  updateProfile,
  changePassword
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from 'fs';

const userRouter = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  }
});

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list", getUsers);
userRouter.delete("/:id", deleteUser);
userRouter.put("/:id/status", updateUserStatus);

// New routes for profile management
userRouter.put("/profile/update", auth, upload.single('profilePicture'), updateProfile);
userRouter.put("/profile/change-password", auth, changePassword);

export default userRouter;
