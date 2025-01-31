// controllers/complaintController.js
import complaintModel from "../models/complaintModel.js";

const createComplaint = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    const { userId,  subject, description } = req.body;
    if (!userId ) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }
    const complaint = await complaintModel.create({
      userId,
     
      subject,
      description,
    });
    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await complaintModel.find()
      .populate('userId', 'name email')
      // .populate('orderId');
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status } = req.body;
    const complaint = await complaintModel.findByIdAndUpdate(
      complaintId,
      { status },
      { new: true }
    );
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createComplaint, getComplaints, updateComplaintStatus };