import { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  FaBox, 
  FaClock, 
  FaMotorcycle, 
  FaCheckCircle, 
  FaTimesCircle,
  FaMoneyBill,
  FaSpinner,
  FaCreditCard
} from 'react-icons/fa';

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
        console.log('Orders data:', response.data.data);
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

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return <FaClock />;
      case 'preparing':
        return <FaBox />;
      case 'on the way':
        return <FaMotorcycle />;
      case 'delivered':
        return <FaCheckCircle />;
      case 'cancelled':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getPaymentStatusIcon = (status, method) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle />;
      case 'pending':
        return method === 'cash' ? <FaMoneyBill /> : <FaSpinner />;
      case 'failed':
        return <FaTimesCircle />;
      default:
        return <FaCreditCard />;
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
        <div className="my-orders-header">
          <img src={assets.chicken} alt="Orders" className="header-icon" />
          <h2>My Orders</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Fetching your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders">
        <div className="my-orders-header">
          <img src={assets.chicken} alt="Orders" className="header-icon" />
          <h2>My Orders</h2>
        </div>
        <div className="no-orders">
          <img src={assets.parcel_icon} alt="No orders" className="no-orders-icon" />
          <h3>No Orders Yet!</h3>
          <p>Looks like you haven't placed any orders. Let's change that!</p>
          <button onClick={() => navigate("/")} className="browse-menu-btn">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders-header">
        <img src={assets.chicken} alt="Orders" className="header-icon" />
        <h2>My Orders</h2>
      </div>
      <div className="container">
        {orders.map((order) => (
          <div key={order._id} className="my-orders-order">
            <div className="order-info">
              <div className="order-images">
                {order.items.slice(0, 3).map((item, index) => (
                  <img 
                    key={`${order._id}-${item.productId}-${index}`}
                    src={item.image?.startsWith('http') ? item.image : `${url}/${item.image}`}
                    alt={item.name}
                    className={`order-food-image ${index > 0 ? 'stacked' : ''}`}
                    title={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = assets.parcel_icon;
                    }}
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">+{order.items.length - 3}</div>
                )}
              </div>
              <div className="order-details">
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <span key={`${order._id}-${item.productId}-${index}`}>
                      {item.name} × <span>{item.quantity}</span>
                      {index < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
                <p className="order-amount">
                  Total: <span>${(order.totalAmount || 0).toFixed(2)}</span>
                </p>
                <p className="order-count">Items: <span>{order.items.length}</span></p>
                <p className="order-payment">
                  Payment: <span>{order.paymentMethod}</span>
                  <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                    {getPaymentStatusIcon(order.paymentStatus, order.paymentMethod)}
                    <span className="status-text">{order.paymentStatus}</span>
                  </span>
                </p>
              </div>
            </div>
            <div className="order-status">
              <div className={`status ${order.status.toLowerCase().replace(' ', '')}`}>
                {getStatusIcon(order.status)}
                <span>{order.status}</span>
              </div>
              <button 
                onClick={() => trackOrder(order._id)}
                disabled={trackingId === order._id}
                className="track-button"
              >
                {trackingId === order._id ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
