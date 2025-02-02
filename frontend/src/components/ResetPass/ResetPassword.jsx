import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import './ResetPassword.css';
import { useLocation, useNavigate } from 'react-router-dom';


const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
    const { url } = useContext(StoreContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
   // Get email and OTP from navigation state
   const email = location.state?.email;
   const otp = location.state?.otp;
   

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${url}/api/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset successful!');
        navigate('/');
        setShowResetPassword(false);
        setShowLoginPopup(true);
      } else {
        toast.error(data.message || 'Password reset failed');
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-overlay">
      <div className="reset-password-container">
      <button 
        className="close-btn" 
        onClick={() => navigate('/verify-otp')}
      >
        ×
      </button>
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="8"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="8"
            />
          </div>
          <div className="password-requirements">
            <p>Password must be at least 8 characters long</p>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;