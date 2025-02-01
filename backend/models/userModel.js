import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    cartData: { type: Object, default: {} },
    isActive: { type: Boolean, required: true, default: false },
    isBlocked: { type: Boolean, required: true, default: false },
    token: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    totalPoints: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
