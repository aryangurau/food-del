import { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; // Import toast

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrder = async () => {
    if (!token) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id]
        });
      }
    });

    if (orderItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    const totalAmount = getTotalCartAmount() + 2;

    const orderData = {
      items: orderItems,
      amount: totalAmount,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipcode, // Note: backend expects zipCode, not zipcode
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone
      }
    };

    console.log("Sending order data:", orderData);

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'token': token,
          'Content-Type': 'application/json'
        },
      });

      console.log("Response received:", response.data);
      
      if (response.data.success) {
        const { url: checkoutUrl } = response.data;
        window.location.replace(checkoutUrl);
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error.response?.data?.message || "Failed to place order";
      toast.error(errorMessage);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="country"
          />
        </div>
        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="text"
          placeholder="phone"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                ${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
              </b>
            </div>
          </div>
          <button type="button" onClick={placeOrder}>Proceed To Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;