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
  FaCreditCard,
  FaBan,
  FaInfoCircle
} from 'react-icons/fa';

const MyOrders = () => {
  const { url, token, formatPrice } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const navigate = useNavigate();

  const canCancelOrder = (order) => {
    if (!order || !order.createdAt) {
      console.log('Invalid order data:', order);
      return false;
    }

    const status = (order.status || 'pending').toLowerCase();
    console.log('Order status:', status);
    
    if (status === 'cancelled' || status === 'delivered') {
      console.log('Order already cancelled or delivered');
      return false;
    }

    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = (now - orderTime) / (1000 * 60);
    
    console.log('Time since order:', diffInMinutes, 'minutes');
    return diffInMinutes <= 5;
  };

  useEffect(() => {
    fetchOrders();
  }, [url, token]);

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      const response = await axios.post(
        `${url}/api/order/cancel`,
        { orderId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'token': token 
          }
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to cancel order");
      }
    } finally {
      setCancellingOrderId(null);
    }
  };

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
        const ordersData = response.data.data;
        console.log('Orders data:', ordersData);
        
        // Add cancellation eligibility check for each order
        ordersData.forEach(order => {
          const canCancel = canCancelOrder(order);
          console.log(`Order ${order._id} can be cancelled:`, canCancel);
        });
        
        setOrders(ordersData);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
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
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: response.data.status, updatedAt: response.data.updatedAt }
              : order
          )
        );
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
    switch(status || 'pending'.toLowerCase()) {
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
      <div className="payment-return-notice">
                    <FaInfoCircle />
                    <div>
                     Cancelled Orders Payment will be returned within 24 hours. For inquiries, call us at{' '}
                      <span className="contact">05656388493</span>
                    </div>
                    </div>
      <div className="container">
        {orders.map((order) => (
          <div key={order._id} className="my-orders-order">
            <div className="order-info">
              <div className="order-images">
                {order.items.slice(0, 3).map((item, index) => (
                  <img 
                    key={`${order._id}-${item.productId}-${index}`}
                    src={item.image?.startsWith('http') ? item.image : `${url}/images/${item.image}`}
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

            <div className="order-meta">
                  <div className="order-status">
                    {/* <span className={`status-icon ${(order.status || 'pending').toLowerCase()}`}>
                      {getStatusIcon(order.status || 'pending')}
                    </span> */}
                    {/* <span className="status-text">{order.status || 'Pending'}</span> */}
                  </div>
                  <div className="order-actions">
                    {canCancelOrder(order) && (order.status || 'pending').toLowerCase() !== 'cancelled' && (
                      <button 
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingOrderId === order._id}
                      >
                        {cancellingOrderId === order._id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <><FaBan /> Cancel Order</>
                        )}
                      </button>
                    )}
                    {/* <button
                      className="track-order-btn"
                      onClick={() => trackOrder(order._id)}
                      disabled={trackingId === order._id}
                    >
                      {trackingId === order._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        "Track Order"
                      )}
                    </button> */}
                  </div>
                </div>
                
                <p className="order-amount">
                  Total: <span>{formatPrice(order.totalAmount)}</span>
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
              <div className={`status ${order.status || 'pending'.toLowerCase().replace(' ', '')}`}>
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
