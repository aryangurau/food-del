// components/ComplaintBox/ComplaintBox.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import './ComplaintBox.css';

import { StoreContext } from '../../context/StoreContext';


const ComplaintBox = ({ userId }) => {

    console.log("userId:", userId);

    const { url } = useContext(StoreContext);

  const [complaint, setComplaint] = useState({
    subject: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Submitting Complaint:", { userId, ...complaint });

    try {
        const response = await axios.post(`${url}/api/complaint/create`, {
            userId,
          
            subject: complaint.subject,
            description: complaint.description,
        });

        if (response.data.success) {
            alert('Complaint submitted successfully');
            setComplaint({ subject: '', description: '' });
        }
    } catch (error) {
        console.error('Failed to submit complaint:', error.response?.data || error.message);
        alert('Failed to submit complaint: ' + (error.response?.data?.message || error.message));
    }
};


  return (
    <div className="complaint-box">
      <h3>Submit a Complaint</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Subject:</label>
          <input
            type="text"
            value={complaint.subject}
            onChange={(e) => setComplaint({...complaint, subject: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={complaint.description}
            onChange={(e) => setComplaint({...complaint, description: e.target.value})}
            required
          />
        </div>
        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
};

export default ComplaintBox;