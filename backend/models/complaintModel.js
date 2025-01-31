// models/Complaint.js
import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
//   orderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'orders',
//     required: true
//   },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const complaintModel = mongoose.models.complaint ||  mongoose.model("complaint", complaintSchema);

export default complaintModel;
