import { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { FaMoneyBillWave, FaMobile, FaCreditCard } from 'react-icons/fa';

const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  KHALTI: 'khalti',
  ESEWA: 'esewa',
  FONEPAY: 'fonepay',
  CASH: 'cash'
};

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, clearCart, formatPrice } =
    useContext(StoreContext);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS.STRIPE);
  const [loading, setLoading] = useState(false);
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

    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal > 0 ? 50 : 0;
    const total = subtotal + deliveryFee;

    const orderData = {
      items: orderItems,
      amount: total,
      paymentMethod: selectedPayment,
      status: "preparing",
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipcode,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone
      }
    };

    setLoading(true);

    try {
      if (selectedPayment === PAYMENT_METHODS.STRIPE) {
        // Use existing Stripe payment flow
        const response = await axios.post(`${url}/api/order/place`, orderData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'token': token,
            'Content-Type': 'application/json'
          },
        });

        if (response.data.success) {
          const { url: checkoutUrl } = response.data;
          window.location.replace(checkoutUrl);
        } else {
          toast.error(response.data.message || "Failed to place order");
        }
      } else if (selectedPayment === PAYMENT_METHODS.CASH) {
        const response = await axios.post(
          `${url}/api/order/create`,
          orderData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          toast.success("Order placed successfully!");
          await clearCart();
          navigate("/my-orders");
        } else {
          setLoading(false);
          toast.error(response.data.message || "Failed to place order");
        }
      } else {
        // Simulate instant success for other payment methods
        const response = await axios.post(`${url}/api/order/place-instant`, orderData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'token': token,
            'Content-Type': 'application/json'
          },
        });

        if (response.data.success) {
          toast.success("Order placed successfully!");
          clearCart(); // Clear the cart after successful order
          navigate("/my-orders"); // Update navigation path to match route
        } else {
          toast.error(response.data.message || "Failed to place order");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error.response?.data?.message || "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

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
              <p>{formatPrice(subtotal)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{formatPrice(deliveryFee)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{formatPrice(total)}</b>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${selectedPayment === PAYMENT_METHODS.STRIPE ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.STRIPE}
                  checked={selectedPayment === PAYMENT_METHODS.STRIPE}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <FaCreditCard className="payment-icon" />
                <span>Credit/Debit Card</span>
              </label>

              <label className={`payment-option ${selectedPayment === PAYMENT_METHODS.KHALTI ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.KHALTI}
                  checked={selectedPayment === PAYMENT_METHODS.KHALTI}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <FaMobile className="payment-icon" />
                <span>Khalti</span>
              </label>

              <label className={`payment-option ${selectedPayment === PAYMENT_METHODS.ESEWA ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.ESEWA}
                  checked={selectedPayment === PAYMENT_METHODS.ESEWA}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <FaMobile className="payment-icon" />
                <span>eSewa</span>
              </label>

              <label className={`payment-option ${selectedPayment === PAYMENT_METHODS.FONEPAY ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.FONEPAY}
                  checked={selectedPayment === PAYMENT_METHODS.FONEPAY}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <FaMobile className="payment-icon" />
                <span>FonePay</span>
              </label>

              <label className={`payment-option ${selectedPayment === PAYMENT_METHODS.CASH ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={PAYMENT_METHODS.CASH}
                  checked={selectedPayment === PAYMENT_METHODS.CASH}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <FaMoneyBillWave className="payment-icon" />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          <button 
            type="button" 
            onClick={placeOrder}
            className="place-order-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : selectedPayment === PAYMENT_METHODS.STRIPE ? 'Proceed to Payment' : 'Place Order'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;