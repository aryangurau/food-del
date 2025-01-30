import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false // Can be null for some transactions
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earn', 'redeem'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
loyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });

const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);

export default LoyaltyTransaction;
