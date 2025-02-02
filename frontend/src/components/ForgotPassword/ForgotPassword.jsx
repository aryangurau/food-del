import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = ({ setShowForgotPassword }) => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Sending forgot password request for email:', email); // Add this debug log

      const response = await fetch(`${url}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Forgot password response:', data); // Add this debug log


      if (data.success) {
        toast.success('Otp has been sent to your email');
        navigate('/verify-otp', { state: { email: email } });
        setShowForgotPassword(false);
       
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error in forgot password:', error); // Add this debug log
      toast.error('Failed to send otp');
    } finally {
      setLoading(false);
    }
  };

  return (

 
    <div className="forgot-password-overlay">
      <div className="forgot-password-container">
        <button className="close-btn" onClick={() => setShowForgotPassword(false)}>
          ×
        </button>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
