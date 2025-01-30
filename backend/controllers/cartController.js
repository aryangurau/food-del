import userModel from "../models/userModel.js";

//add items to user cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    cartData[req.body.itemId] = (cartData[req.body.itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added to cart", cartData });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

//remove items from user cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
      if (cartData[req.body.itemId] === 0) {
        delete cartData[req.body.itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Removed from cart", cartData });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

// fetch user cart data
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

// clear user cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Cart cleared", cartData: {} });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Error clearing cart" });
  }
};

export { addToCart, removeFromCart, getCart, clearCart };
