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
    recentOrders: [],
    salesByDate: {},
    paymentMethodStats: {
      online: 0,
      cash: 0
    }
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

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderResponse, foodResponse] = await Promise.all([
        axios.get(url + "/api/order/list"),
        axios.get(`${url}/api/food/list`)
      ]);

      if (orderResponse.data.success && foodResponse.data.success) {
        // First, fetch all users to get their details
        const userResponse = await axios.get(`${url}/api/user/list`);
        const users = userResponse.data.success ? userResponse.data.data : [];
        
        // Create a map of user details for quick lookup
        const userMap = users.reduce((acc, user) => {
          // Handle both email and _id as potential keys
          if (user._id) acc[user._id] = user;
          if (user.email) acc[user.email] = user;
          return acc;
        }, {});

        const orders = orderResponse.data.data.map(order => {
          // Try to find user by either userId or email
          const user = userMap[order.userId] || userMap[order.email] || {
            name: order.customerName || order.shippingDetails?.fullName,
            phone: order.shippingDetails?.phone || order.phone,
            email: order.email
          };

          return {
            ...order,
            amount: Number(order.amount) || 0,
            paymentMethod: order.paymentMethod?.toLowerCase() || 'cash',
            createdAt: order.createdAt || new Date().toISOString(),
            user: {
              name: user.name || user.fullName || order.customerName || 'N/A',
              phone: user.phone || order.shippingDetails?.phone || order.phone || 'N/A',
              email: user.email || order.email || 'N/A'
            }
          };
        });

        const foodList = foodResponse.data.data;

        const pendingOrders = orders.filter(
          (order) => order.status === "Food Processing"
        ).length;
        const deliveredOrders = orders.filter(
          (order) => order.status === "Delivered"
        ).length;
        
        // Calculate total sales and payment stats
        const { totalSales, paymentMethodStats } = orders.reduce((acc, order) => {
          acc.totalSales += order.amount;
          acc.paymentMethodStats[order.paymentMethod] += order.amount;
          return acc;
        }, {
          totalSales: 0,
          paymentMethodStats: { online: 0, cash: 0 }
        });

        const onlineTransactions = orders.filter(
          (order) => order.paymentMethod === "online"
        ).length;

        // Calculate sales by date
        const salesByDate = orders.reduce((acc, order) => {
          const date = formatDate(order.createdAt);
          if (date !== "Invalid Date") {
            acc[date] = (acc[date] || 0) + order.amount;
          }
          return acc;
        }, {});

        // Get recent orders (last 10)
        const recentOrders = orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setDashboardData({
          totalDishes: foodList.length,
          pendingOrders,
          totalOrders: orders.length,
          delivered: deliveredOrders,
          totalSales,
          onlineTransactions,
          recentOrders,
          salesByDate,
          paymentMethodStats
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
      value: `Rs. ${Math.round(dashboardData.totalSales).toLocaleString()}`,
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
    }
  ];

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        {cards.map((card, index) => (
          <div key={index} className={`dashboard-card ${card.bgColor}`}>
            <div className="card-icon">{card.icon}</div>
            <div className="card-info">
              <h3>{card.title}</h3>
              <p className="value">{card.value}</p>
              <p className="trend">{card.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sales-report">
        <h2>Sales Report</h2>
        <div className="sales-stats">
          <div className="payment-methods">
            <h3>Payment Methods</h3>
            <div className="stats-container">
              <div className="stat-item">
                <span>Online Payments</span>
                <span className="amount">Rs. {Math.round(dashboardData.paymentMethodStats.online).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span>Cash Payments</span>
                <span className="amount">Rs. {Math.round(dashboardData.paymentMethodStats.cash).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="daily-sales">
            <h3>Daily Sales</h3>
            <div className="stats-container">
              {Object.entries(dashboardData.salesByDate)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .slice(0, 7)
                .map(([date, amount]) => (
                  <div key={date} className="stat-item">
                    <span>{date}</span>
                    <span className="amount">Rs. {Math.round(amount).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="recent-orders">
          <h3>Recent Orders</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>{order.user.name}</td>
                    <td>
                      {order.user.phone !== 'N/A' ? (
                        <a href={`tel:${order.user.phone}`} className="phone-link">
                          {order.user.phone}
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>Rs. {Math.round(order.amount).toLocaleString()}</td>
                    <td>
                      <span className={`payment-badge ${order.paymentMethod}`}>
                        {order.paymentMethod === 'online' ? 'Online' : 'Cash'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
