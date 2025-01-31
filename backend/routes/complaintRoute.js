import express from "express";
import {
    createComplaint,
    getComplaints, updateComplaintStatus
} from "../controllers/complaintController.js";


const complaintRouter = express.Router();

complaintRouter.post("/create", createComplaint);
complaintRouter.get("/list", getComplaints);
complaintRouter.put("/:id/status", updateComplaintStatus);

export default complaintRouter;
