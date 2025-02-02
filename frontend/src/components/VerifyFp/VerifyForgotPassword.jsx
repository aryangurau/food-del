import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import './VerifyForgotPassword.css';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * VerifyForgotPassword component
 * 
 * This component is used to verify the OTP sent to the user's email address
 * during the forgot password process.
 * 
 * The component expects the email address to be provided in the location state
 * as a string. If no email address is provided, the component renders an error
 * message with a link to go back to the login page.
 * 
 * The component renders a form with a single input field for the OTP, and a
 * submit button that is disabled while the component is waiting for the
 * verification response from the server.
 * 
 * When the form is submitted, the component sends a POST request to the
 * /api/user/verify-otp endpoint with the email address and OTP in the request
 * body. If the response is successful, the component navigates to the
 * /reset-password page with the email address and OTP in the location state.
 * Otherwise, the component renders an error message.
 */
const VerifyForgotPassword = () => {  // Remove props since we're using location state
  const navigate = useNavigate();
  const location = useLocation();
  const { url } = useContext(StoreContext);
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  
  const email = location.state?.email;  // Get email from location state

  console.log('Location state:', location.state); // Add this to debug
  console.log('Email received:', email); // Add this to debug

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Sending verification request with:', { email, otp });
      
      const response = await fetch(`${url}/api/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (data.success) {
        toast.success('OTP verified successfully!');
        navigate('/reset-password', { state: { email, otp } });
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Add check for email
  if (!email) {
    return (
      <div className="verify-otp-overlay">
        <div className="verify-otp-container">
          <h2>Error</h2>
          <p>No email provided. Please try the forgot password process again.</p>
          <button onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-otp-overlay">
      <div className="verify-otp-container">
      <button 
        className="close-btn" 
        onClick={() => navigate('/')}
      >
        ×
      </button>
        <h2>Verify OTP</h2>
        <p>Please enter the OTP sent to {email}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyForgotPassword;