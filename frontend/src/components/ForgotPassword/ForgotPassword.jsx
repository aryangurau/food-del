import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import './ForgotPassword.css';

const ForgotPassword = ({ setShowForgotPassword }) => {
  const { url } = useContext(StoreContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${url}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset link sent to your email!');
        setShowForgotPassword(false);
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to send reset link');
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
