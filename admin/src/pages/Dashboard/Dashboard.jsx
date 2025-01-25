import "./Dashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { toast } from "react-hot-toast";
import { FaMoneyBillWave, FaShoppingBag, FaUsers, FaUtensils, FaClock, FaCheckCircle } from 'react-icons/fa';

const Dashboard = ({ url }) => {
  const { adminToken } = useAdminAuth();
  const [dashboardData, setDashboardData] = useState({
    totalDishes: 0,
    pendingOrders: 0,
    totalOrders: 0,
    delivered: 0,
    totalSales: 0,
    totalUsers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("DateTime formatting error:", error);
      return "Invalid Date";
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${url}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'token': adminToken
        }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setError(error.message || "Failed to fetch dashboard data");
      toast.error(error.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchDashboardData();
    }
  }, [adminToken]);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="spinner">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card revenue">
          <FaMoneyBillWave className="icon" />
          <h3>Total Revenue</h3>
          <p>₹{(dashboardData?.totalSales || 0).toLocaleString()}</p>
        </div>

        <div className="stat-card orders">
          <FaShoppingBag className="icon" />
          <h3>Total Orders</h3>
          <p>{dashboardData?.totalOrders || 0}</p>
        </div>

        <div className="stat-card users">
          <FaUsers className="icon" />
          <h3>Total Users</h3>
          <p>{dashboardData?.totalUsers || 0}</p>
        </div>

        <div className="stat-card dishes">
          <FaUtensils className="icon" />
          <h3>Total Dishes</h3>
          <p>{dashboardData?.totalDishes || 0}</p>
        </div>

        <div className="stat-card pending">
          <FaClock className="icon" />
          <h3>Pending Orders</h3>
          <p>{dashboardData?.pendingOrders || 0}</p>
        </div>

        <div className="stat-card delivered">
          <FaCheckCircle className="icon" />
          <h3>Delivered Orders</h3>
          <p>{dashboardData?.delivered || 0}</p>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <div className="orders-list">
          {(dashboardData?.recentOrders || []).map((order) => (
            <div key={order._id} className="order-item">
              <div className="order-header">
                <span className="order-id">Order #{order._id?.slice(-6) || 'N/A'}</span>
                <span className={`order-status ${(order.status || '').toLowerCase()}`}>
                  {order.status || 'N/A'}
                </span>
              </div>
              <div className="order-details">
                <p>
                  <strong>Customer:</strong> {order.user?.name || "N/A"}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{(order.total || 0).toLocaleString()}
                </p>
                <p>
                  <strong>Date:</strong> {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
