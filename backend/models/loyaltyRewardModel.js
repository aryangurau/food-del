import mongoose from 'mongoose';

const loyaltyRewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  pointsCost: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const LoyaltyReward = mongoose.model('LoyaltyReward', loyaltyRewardSchema);

export default LoyaltyReward;
