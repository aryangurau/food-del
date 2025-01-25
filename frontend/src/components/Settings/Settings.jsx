import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './Settings.css';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, setUser, url } = useContext(StoreContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            }));
            if (user.profilePicture) {
                setPreviewImage(user.profilePicture);
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('address', formData.address);
            
            if (profileImage) {
                formDataToSend.append('profilePicture', profileImage);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to update your profile');
                return;
            }

            const response = await axios.put(
                `${url}/api/user/profile/update`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'token': token
                    }
                }
            );

            if (response.data.success) {
                setUser(response.data.user);
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                toast.error(response.data.message || 'Error updating profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                // Optional: Redirect to login page or clear user session
            } else {
                toast.error(error.response?.data?.message || 'Error updating profile');
            }
        }
        setLoading(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to change your password');
                return;
            }

            const response = await axios.put(
                `${url}/api/user/profile/change-password`,
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    }
                }
            );

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            } else {
                toast.error(response.data.message || 'Error changing password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                // Optional: Redirect to login page or clear user session
            } else {
                toast.error(error.response?.data?.message || 'Error changing password');
            }
        }
        setLoading(false);
    };

    if (!user) {
        return <div className="settings-container">Please log in to access settings.</div>;
    }

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            
            <div className="settings-section">
                <h2>Profile Settings</h2>
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label>Profile Picture</label>
                        <div className="profile-image-container">
                            {previewImage && (
                                <img 
                                    src={previewImage} 
                                    alt="Profile Preview" 
                                    className="profile-preview"
                                />
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-actions">
                        {!isEditing ? (
                            <button type="button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            ...formData,
                                            name: user.name || '',
                                            email: user.email || '',
                                            phone: user.phone || '',
                                            address: user.address || ''
                                        });
                                        setPreviewImage(user.profilePicture);
                                        setProfileImage(null);
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            <div className="settings-section">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordChange} className="settings-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
