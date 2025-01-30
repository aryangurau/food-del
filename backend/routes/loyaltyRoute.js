import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/auth.js";
import { LoyaltyTransaction, LoyaltyReward } from "../models/loyaltyModel.js";
import userModel from "../models/userModel.js";

const loyaltyRouter = express.Router();

// Constants for loyalty program
const POINTS_THRESHOLD = 500; // Points needed for discount
const DISCOUNT_PERCENTAGE = 10; // 10% discount when using points

// Get user's points balance and history
loyaltyRouter.get("/points", authMiddleware, async (req, res) => {
  try {
    const transactions = await LoyaltyTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    const totalPoints = transactions.reduce((acc, curr) => 
      curr.type === 'earn' ? acc + curr.points : acc - curr.points, 0);

    res.json({
      success: true,
      points: totalPoints,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get available rewards
loyaltyRouter.get("/rewards", authMiddleware, async (req, res) => {
  try {
    const rewards = await LoyaltyReward.find({ isActive: true });
    res.json({
      success: true,
      rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Redeem points for a reward
loyaltyRouter.post("/redeem", authMiddleware, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const reward = await LoyaltyReward.findById(rewardId);
    
    if (!reward || !reward.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward"
      });
    }

    const transactions = await LoyaltyTransaction.find({ userId: req.user._id });
    const totalPoints = transactions.reduce((acc, curr) => 
      curr.type === 'earn' ? acc + curr.points : acc - curr.points, 0);

    if (totalPoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points"
      });
    }

    const redemption = new LoyaltyTransaction({
      userId: req.user._id,
      type: 'redeem',
      points: reward.pointsCost,
      source: 'redemption',
      description: `Redeemed for ${reward.name}`
    });

    await redemption.save();

    res.json({
      success: true,
      message: "Reward redeemed successfully",
      remainingPoints: totalPoints - reward.pointsCost,
      reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Apply points for discount
loyaltyRouter.post("/apply-points", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await userModel.findById(req.user._id);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has enough points
    if (user.totalPoints < POINTS_THRESHOLD) {
      throw new Error(`Insufficient points. Need ${POINTS_THRESHOLD} points for Rs. ${DISCOUNT_PERCENTAGE}% discount`);
    }

    // Create transaction record
    const transaction = new LoyaltyTransaction({
      userId: user._id,
      type: 'redeem',
      points: POINTS_THRESHOLD,
      source: 'redemption',
      description: `Redeemed ${POINTS_THRESHOLD} points for ${DISCOUNT_PERCENTAGE}% order discount`
    });

    await transaction.save({ session });

    // Update user's points balance
    user.totalPoints -= POINTS_THRESHOLD;
    await user.save({ session });

    await session.commitTransaction();
    
    res.json({
      success: true,
      message: `Successfully applied ${POINTS_THRESHOLD} points for ${DISCOUNT_PERCENTAGE}% discount`,
      remainingPoints: user.totalPoints
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
});

export default loyaltyRouter;