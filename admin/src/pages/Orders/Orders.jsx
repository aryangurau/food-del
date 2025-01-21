import { useState } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchAllOrders = async (page = 1) => {
    const response = await axios.get(`${url}/api/order/list?page=${page}&limit=10`);
    if (response.data.success) {
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } else {
      toast.error("Error");
    }
  };

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/order/status", {
      orderId,
      status: event.target.value,
    });
    if (response.data.success) {
      await fetchAllOrders(currentPage);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAllOrders(page);
  };

  const formatAddress = (address) => {
    if (!address) return "No address provided";
    
    const {
      firstName,
      lastName,
      street,
      city,
      state,
      zipcode,
      country,
      phone
    } = address;

    return (
      <div className="address-details">
        <p className="customer-name">{firstName} {lastName}</p>
        <p className="street">{street}</p>
        <p className="city-state">{city}, {state} {zipcode}</p>
        <p className="country">{country}</p>
        <p className="phone">{phone}</p>
      </div>
    );
  };

  useEffect(() => {
    fetchAllOrders(1);
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div className="order-details">
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " X " + item.quantity;
                  } else {
                    return item.name + " X " + item.quantity + ", ";
                  }
                })}
              </p>
              <p className="order-amount">Order Total: ${order.amount}</p>
              {formatAddress(order.address)}
              <div className="status-container">
                <p>Status:</p>
                <select
                  defaultValue={order.status}
                  onChange={(e) => statusHandler(e, order._id)}
                >
                  <option value="preparing">Preparing</option>
                  <option value="prepared">Prepared</option>
                  <option value="ontheway">On the way</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        
        <div className="pagination-numbers">
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>

      <div className="pagination-info">
        Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} orders
      </div>
    </div>
  );
};

export default Orders;
