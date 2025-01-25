import { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-hot-toast";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  const trackOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        url + "/api/order/track",
        { orderId },
        { headers: { token } }
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => {
          return (
            <div className="my-orders-order" key={index}>
              <img src={assets.parcel_icon} alt="" />
              <p>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + "×" + item.quantity;
                  } else {
                    return item.name + "×" + item.quantity + ", ";
                  }
                })}
              </p>
              <p>${order.amount}.00</p>
              <p>Items: {order.items.length}</p>
              <p className={`status ${order.status.toLowerCase()}`}>
                <span>●</span>
                <b>{order.status}</b>
              </p>
              <button 
                onClick={() => trackOrder(order._id)}
                disabled={loading}
                className={loading ? "loading" : ""}
              >
                {loading ? "Tracking..." : "Track Order"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
