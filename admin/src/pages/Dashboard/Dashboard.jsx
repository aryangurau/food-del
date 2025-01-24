import "./Dashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = ({ url }) => {
  const [dashboardData, setDashboardData] = useState({
    totalDishes: 0,
    pendingOrders: 0,
    totalOrders: 0,
    delivered: 0,
    totalSales: 0,
    onlineTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderResponse, foodResponse] = await Promise.all([
        axios.get(url + "/api/order/list"),
        axios.get(`${url}/api/food/list`)
      ]);

      if (orderResponse.data.success && foodResponse.data.success) {
        const orders = orderResponse.data.data;
        const foodList = foodResponse.data.data;

        const pendingOrders = orders.filter(
          (order) => order.status === "Food Processing"
        ).length;
        const deliveredOrders = orders.filter(
          (order) => order.status === "Delivered"
        ).length;
        const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
        const onlineTransactions = orders.filter(
          (order) => order.paymentMethod === "online"
        ).length;

        setDashboardData({
          totalDishes: foodList.length,
          pendingOrders,
          totalOrders: orders.length,
          delivered: deliveredOrders,
          totalSales,
          onlineTransactions,
        });
      } else {
        setError("Failed to fetch data. Please try again later.");
      }
    } catch (error) {
      setError("An error occurred while fetching data.");
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchOrderDetails, 300000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Total Dishes",
      value: dashboardData.totalDishes,
      icon: "🍽️",
      bgColor: "bg-green",
      trend: "+5% from last week"
    },
    {
      title: "Pending Orders",
      value: dashboardData.pendingOrders,
      icon: "⏳",
      bgColor: "bg-orange",
      trend: "Active now"
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders,
      icon: "📊",
      bgColor: "bg-blue",
      trend: "All time"
    },
    {
      title: "Delivered",
      value: dashboardData.delivered,
      icon: "✅",
      bgColor: "bg-green",
      trend: "Successfully completed"
    },
    {
      title: "Total Sales",
      value: `Rs. ${dashboardData.totalSales.toLocaleString()}`,
      icon: "💰",
      bgColor: "bg-purple",
      trend: "Revenue generated"
    },
    {
      title: "Online Transactions",
      value: dashboardData.onlineTransactions,
      icon: "💳",
      bgColor: "bg-cyan",
      trend: "Digital payments"
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={fetchOrderDetails}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <button className="refresh-button" onClick={fetchOrderDetails}>
          Refresh Data
        </button>
      </div>
      <div className="cards-container">
        {cards.map((card, index) => (
          <div key={index} className={`dashboard-card ${card.bgColor}`}>
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <h2>{card.title}</h2>
              <p className="card-value">{card.value}</p>
              <span className="card-trend">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
