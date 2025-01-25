import { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'token': token 
          }
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to view your orders");
        navigate("/login");
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (orderId) => {
    try {
      setTrackingId(orderId);
      const response = await axios.post(
        `${url}/api/order/track`,
        { orderId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'token': token 
          }
        }
      );
      
      if (response.data.success) {
        toast.success(`Order Status: ${response.data.status}`);
        fetchOrders(); // Refresh orders to show updated status
      } else {
        toast.error(response.data.message || "Failed to track order");
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error("Failed to track order");
    } finally {
      setTrackingId(null);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view your orders");
      navigate("/login");
    } else {
      fetchOrders();
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/")}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {orders.map((order) => (
          <div className="my-orders-order" key={order._id}>
            <img src={assets.parcel_icon} alt="" />
            <div className="order-details">
              <p className="order-items">
                {order.items.map((item, index) => (
                  <span key={item._id}>
                    {item.name} × {item.quantity}
                    {index < order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              <p className="order-amount">Total: ${order.amount.toFixed(2)}</p>
              <p className="order-count">Items: {order.items.length}</p>
              <p className={`status ${order.status.toLowerCase()}`}>
                <span>●</span>
                <b>{order.status}</b>
              </p>
            </div>
            <button 
              onClick={() => trackOrder(order._id)}
              disabled={trackingId === order._id}
              className={trackingId === order._id ? "loading" : ""}
            >
              {trackingId === order._id ? "Tracking..." : "Track Order"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
