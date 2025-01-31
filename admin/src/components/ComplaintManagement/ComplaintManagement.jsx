// admin/components/ComplaintManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


const ComplaintManagement = ({url}) => {
  const [complaints, setComplaints] = useState([]);
  console.log("Complaints:", complaints);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`${url}/api/complaint/list`);
      console.log(response.data); // Log the entire response
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };
  const updateStatus = async (complaintId, status) => {
    try {
      await axios.put(`${url}/api/complaints/status`, { complaintId, status });
      fetchComplaints();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="complaint-management">
      <h2>Complaint Management</h2>
      <table>
  <thead>
    <tr>
      {/* <th>UserName</th> */}
      <th>User ID</th>
      <th>Subject</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
  {complaints.map(complaint => (
    <tr key={complaint._id}>
      {/* <td>{complaint.orderId ? complaint.orderId._id : 'N/A'}</td> */}
      <td>{complaint.userId ? complaint.userId._id : 'N/A'}</td>
      <td>{complaint.subject}</td>
      <td>{complaint.status}</td>
      <td>
        <select
          value={complaint.status}
          onChange={(e) => updateStatus(complaint._id, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </td>
    </tr>
  ))}
</tbody>
</table>
    </div>
  );
};

export default ComplaintManagement;