import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const navigate = useNavigate();
  const { token, setToken, url } = useContext(StoreContext);

  const fetchLoyaltyPoints = async () => {
    try {
      const response = await axios.get(`${url}/api/loyalty/points`, {
        headers: { 'Authorization': `Bearer ${token}`, 'token': token }
      });

      if (response.data.success) {
        setLoyaltyPoints(response.data.points);
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      toast.error('Failed to fetch loyalty points');
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!token) {
          toast.error('Please login to view your profile');
          navigate('/', { state: { showLogin: true } });
          return;
        }

        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          toast.error('User data not found');
          localStorage.removeItem('token');
          setToken('');
          navigate('/', { state: { showLogin: true } });
          return;
        }

        setUser(userData);
        await fetchLoyaltyPoints();
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error loading profile data');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, token, setToken, url]);

  const handleEditProfile = () => {
    toast.success('Edit profile feature coming soon!');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>Error loading profile</h2>
        <p>Please try logging in again</p>
        <button onClick={() => navigate('/', { state: { showLogin: true } })}>
          Go to Login
        </button>
      </div>
    );
  }

  const calculateLoyaltyProgress = () => {
    const progress = (loyaltyPoints / 300) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <FaUser className="profile-icon" />
        <h2>My Profile</h2>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-field">
            <div className="field-icon">
              <FaUser />
            </div>
            <div className="field-content">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon">
              <FaEnvelope />
            </div>
            <div className="field-content">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon">
              <FaPhone />
            </div>
            <div className="field-content">
              <label>Phone</label>
              <p>{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon loyalty-icon">
              <FaStar />
            </div>
            <div className="field-content">
              <label>Loyalty Points</label>
              <p>{loyaltyPoints} points</p>
              <div className="loyalty-progress">
                <div 
                  className="loyalty-bar" 
                  style={{ width: `${calculateLoyaltyProgress()}%` }}
                ></div>
              </div>
              <div className="loyalty-milestones">
                <span>0</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
              </div>
            </div>
          </div>
        </div>

        <button className="edit-profile-btn" onClick={handleEditProfile}>
          <FaEdit /> Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
