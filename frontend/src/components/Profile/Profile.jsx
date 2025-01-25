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
                const ordersResponse = await axios.post(`${url}/api/order/userorders`, 
                    { userId: user._id },
                    {
                        headers: { token: localStorage.getItem('token') }
                    }
                );
                
                if (ordersResponse.data.success) {
                    const allOrders = ordersResponse.data.data;
                    setRecentOrders(allOrders.slice(0, 5)); // Get last 5 orders
                    
                    // Calculate statistics
                    const totalSpent = allOrders.reduce((sum, order) => sum + order.amount, 0);
                    
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
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatCurrency = (amount) => {
        return `NPR ${amount.toFixed(2)}`;
    };

    if (!user) {
        return <div className="profile-container">Please log in to view your profile.</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-picture">
                    <img src={user.profilePicture || assets.user} alt={user.name} />
                </div>
                <div className="profile-info">
                    <h1>{user.name}</h1>
                    <p className="member-since">Member since {formatDate(user.createdAt || new Date())}</p>
                </div>
            </div>

            <div className="profile-sections">
                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Email:</label>
                            <p>{user.email}</p>
                        </div>
                        <div className="info-item">
                            <label>Phone:</label>
                            <p>{user.phone || 'Not provided'}</p>
                        </div>
                        <div className="info-item">
                            <label>Address:</label>
                            <p>{user.address || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Account Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Orders</h3>
                            <p>{stats.totalOrders}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Spent</h3>
                            <p>{formatCurrency(stats.totalSpent)}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Recent Orders</h3>
                            <p>{recentOrders.length}</p>
                        </div>
                    </div>
                </div>

                {recentOrders.length > 0 && (
                    <div className="profile-section">
                        <h2>Recent Orders</h2>
                        <div className="orders-list">
                            {recentOrders.map((order) => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-date">{formatDate(order.createdAt)}</span>
                                        <span className={`order-status status-${order.status?.toLowerCase()}`}>
                                            {order.status || 'Processing'}
                                        </span>
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <img 
                                                    src={item.image || assets.food_placeholder} 
                                                    alt={item.name} 
                                                    className="item-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = assets.food_placeholder;
                                                    }}
                                                />
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-quantity">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-footer">
                                        <span className="order-total">{formatCurrency(order.amount)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
