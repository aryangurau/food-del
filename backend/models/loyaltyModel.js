import mongoose from "mongoose";

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['earn', 'redeem'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    enum: ['order', 'review', 'referral', 'admin_adjustment', 'redemption'],
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    sparse: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const loyaltyRewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  pointsCost: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['discount', 'free_item', 'delivery_free'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export const LoyaltyTransaction = mongoose.models.LoyaltyTransaction || mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
export const LoyaltyReward = mongoose.models.LoyaltyReward || mongoose.model('LoyaltyReward', loyaltyRewardSchema);