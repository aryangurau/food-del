import { useState, useEffect } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaBox, FaSpinner } from 'react-icons/fa';
import { useAdminAuth } from "../../context/AdminAuthContext";
import Pagination from "../../components/Pagination/Pagination";

const ORDERS_PER_PAGE = 5;

const Orders = ({ url }) => {
  const { adminToken } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${url}/api/admin/orders`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'token': adminToken
          }
        }
      );
      
      if (response.data.success) {
        const allOrders = response.data.data || [];
        setOrders(allOrders);
        setTotalPages(Math.ceil(allOrders.length / ORDERS_PER_PAGE));
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to fetch orders");
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [url, adminToken]);

  const statusHandler = async (e, orderId, type) => {
    const value = e.target.value;
    try {
      const updateData = type === 'payment' 
        ? { orderId, paymentStatus: value }
        : { orderId, status: value };

      const response = await axios.post(
        `${url}/api/order/status`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, [type === 'payment' ? 'paymentStatus' : 'status']: value }
            : order
        ));
        toast.success(`${type === 'payment' ? 'Payment status' : 'Order status'} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      toast.error(error.response?.data?.message || error.message || `Failed to update ${type} status`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginatedOrders = () => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    return orders.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="orders loading">
        <FaSpinner className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders error">
        <div className="error-message">
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <button onClick={fetchAllOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h2>Orders Management</h2>
        <p>Total Orders: {orders.length}</p>
      </div>

      <div className="orders-list">
        {getPaginatedOrders().map((order) => (
          <div key={order._id} className={`order-item ${(order.status || '').toLowerCase()}`}>
            <div className="order-icon">
              <FaBox />
            </div>
            
            <div className="order-details">
              <div className="order-header">
                <span className="order-id">Order #{order._id.slice(-5)}</span>
                <span className={`order-status ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-info">
                <div className="info-group">
                  <h4>Order Details</h4>
                  <div className="order-details">
                    <p><strong>Amount:</strong> ₹{order.totalAmount}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p>
                      <strong>Payment:</strong>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => statusHandler(e, order._id, 'payment')}
                        className={order.paymentStatus?.toLowerCase()}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </p>
                  </div>
                </div>

                <div className="info-group">
                  <h4>Customer Details</h4>
                  <div className="customer-info">
                    <p><strong>Name:</strong> {order.address?.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {order.address?.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {order.address?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="info-group">
                  <h4>Delivery Address</h4>
                  <div className="address-details">
                    <p><strong>Street:</strong> {order.address?.street || 'N/A'}</p>
                    <p><strong>City:</strong> {order.address?.city || 'N/A'}</p>
                    <p><strong>State:</strong> {order.address?.state || 'N/A'}</p>
                    <p><strong>Country:</strong> {order.address?.country || 'N/A'}</p>
                    <p><strong>Zip Code:</strong> {order.address?.zipCode || 'N/A'}</p>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Order Items</h4>
                  <div className="items-list">
                    {(order.items || []).map((item, index) => (
                      <div key={index} className="item">
                        <span>{item.name}</span>
                        <span>×{item.quantity}</span>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="status-container">
                  <p>Update Status:</p>
                  <select
                    value={order.status || ''}
                    onChange={(e) => statusHandler(e, order._id, 'order')}
                    className={order.status?.toLowerCase()}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="prepared">Prepared</option>
                    <option value="ontheway">On the Way</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={ORDERS_PER_PAGE}
          totalItems={orders.length}
        />
      )}
    </div>
  );
};

export default Orders;
