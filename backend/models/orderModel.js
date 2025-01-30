import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  sessionId: {
    type: String,
    sparse: true,
    unique: true
  },
  transactionId: {
    type: String,
    sparse: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending", "preparing", "prepared", "ontheway", "delivered", "cancelled", "completed"],
    default: "pending",
  },
  address: {
    type: addressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["stripe", "khalti", "esewa", "fonepay", "cash"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { 
  strict: true,
  strictQuery: true
});

// Remove any pre-save hooks that might be checking for address
orderSchema.pre('save', function(next) {
  next();
});

const orderModel = mongoose.models.orders || mongoose.model("orders", orderSchema);

export default orderModel;
