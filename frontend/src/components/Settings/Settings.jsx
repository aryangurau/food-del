import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './Settings.css';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, setUser, url } = useContext(StoreContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setProfileImage(e.target.files[0]);
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

            const response = await axios.put(`${url}/api/user/update-profile`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'token': localStorage.getItem('token')
                }
            });

            if (response.data.success) {
                setUser(response.data.user);
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
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
            const response = await axios.put(
                `${url}/api/user/change-password`,
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                {
                    headers: {
                        'token': localStorage.getItem('token')
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
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error changing password');
        }
        setLoading(false);
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            
            <div className="settings-section">
                <h2>Profile Settings</h2>
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label>Profile Picture</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={!isEditing}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
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
                                    onClick={() => setIsEditing(false)}
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
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
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
