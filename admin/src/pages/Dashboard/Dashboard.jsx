import "./Dashboard.css";
import  { useState, useEffect } from "react";
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

  const fetchOrderDetails = async () => {
    try {
      const orderResponse = await axios.get(url + "/api/order/list");
      const foodResponse = await axios.get(`${url}/api/food/list`);  // Fetching food items for totalDishes
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

        setDashboardData({
          totalDishes: foodList.length, // Dynamically set totalDishes based on food items
          pendingOrders,
          totalOrders: orders.length,
          delivered: deliveredOrders,
          totalSales,
          onlineTransactions: 0, // Add logic if there are online transactions.
        });
      } else {
        console.error("Failed to fetch orders or food list");
      }
    } catch (error) {
      console.error("Error fetching order or food details:", error);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const cards = [
    { title: "Total Dishes", value: dashboardData.totalDishes, bgColor: "bg-green" },
    { title: "Pending Orders", value: dashboardData.pendingOrders, bgColor: "bg-red" },
    { title: "Total Orders", value: dashboardData.totalOrders, bgColor: "bg-tomato" },
    { title: "Delivered", value: dashboardData.delivered, bgColor: "bg-blue" },
    { title: "Total Sales", value: `Rs. ${dashboardData.totalSales}`, bgColor: "bg-purple" },
    { title: "Online Transactions", value: `${dashboardData.onlineTransactions}$`, bgColor: "bg-brown" },
  ];

  return (
    <div className="container">
      {cards.map((card, index) => (
        <div key={index} className={`dashboard-card ${card.bgColor}`}>
          <h2>{card.title}</h2>
          <p>{card.value}</p>
          <a href="#">View Details</a>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
