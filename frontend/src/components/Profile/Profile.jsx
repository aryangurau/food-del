import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Profile.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, url } = useContext(StoreContext);
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        favoriteItems: []
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                // Fetch recent orders
                const ordersResponse = await axios.get(`${url}/api/order/user-orders`, {
                    headers: { token: localStorage.getItem('token') }
                });
                
                if (ordersResponse.data.success) {
                    setRecentOrders(ordersResponse.data.orders.slice(0, 5)); // Get last 5 orders
                    
                    // Calculate statistics
                    const allOrders = ordersResponse.data.orders;
                    const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);
                    
                    // Calculate favorite items
                    const itemCounts = {};
                    allOrders.forEach(order => {
                        order.items.forEach(item => {
                            itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
                        });
                    });
                    
                    const favoriteItems = Object.entries(itemCounts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([name]) => name);

                    setStats({
                        totalOrders: allOrders.length,
                        totalSpent,
                        favoriteItems
                    });
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        if (user) {
            fetchUserDetails();
        }
    }, [user, url]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'NPR'
        }).format(amount);
    };

    if (!user) {
        return <div className="profile-container">Please log in to view your profile.</div>;
    }

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-info-main">
                    <div className="profile-picture-large">
                        <img 
                            src={user.profilePicture || assets.profile_icon} 
                            alt="Profile"
                        />
                    </div>
                    <div className="profile-title">
                        <h1>{user.name}</h1>
                        <p className="member-since">Member since {formatDate(user.createdAt)}</p>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                {/* Personal Information */}
                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Full Name</span>
                            <span className="value">{user.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Email</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Phone</span>
                            <span className="value">{user.phone || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Address</span>
                            <span className="value">{user.address || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                {/* Account Statistics */}
                <div className="profile-section">
                    <h2>Account Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-value">{stats.totalOrders}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{formatCurrency(stats.totalSpent)}</span>
                            <span className="stat-label">Total Spent</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{recentOrders.length}</span>
                            <span className="stat-label">Recent Orders</span>
                        </div>
                    </div>
                </div>

                {/* Favorite Items */}
                {stats.favoriteItems.length > 0 && (
                    <div className="profile-section">
                        <h2>Your Favorite Items</h2>
                        <div className="favorite-items">
                            {stats.favoriteItems.map((item, index) => (
                                <div key={index} className="favorite-item">
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                <div className="profile-section">
                    <h2>Recent Orders</h2>
                    {recentOrders.length > 0 ? (
                        <div className="recent-orders">
                            {recentOrders.map((order) => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-date">{formatDate(order.createdAt)}</span>
                                        <span className="order-total">{formatCurrency(order.total)}</span>
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item, index) => (
                                            <span key={index} className="order-item">
                                                {item.name} x {item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="order-status">
                                        Status: <span className={`status-${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-orders">No recent orders found.</p>
                    )}
                    <Link to="/myorders" className="view-all-orders">
                        View All Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;
