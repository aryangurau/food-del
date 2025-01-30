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

const POINTS_REQUIRED = 300;
const DISCOUNT_PERCENT = 50;

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
  const [usePoints, setUsePoints] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await axios.get(`${url}/api/loyalty/points`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setPoints(response.data.points);
        }
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };

    if (token) {
      fetchPoints();
    }
  }, [token, url]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

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
    const deliveryFee = subtotal > 0 ? 20 : 0;
    let total = subtotal + deliveryFee;

    // Apply loyalty points discount if selected
    if (usePoints && points >= POINTS_REQUIRED) {
      const discount = total * (DISCOUNT_PERCENT / 100); // 50% discount
      total -= discount;
    }

    const orderData = {
      items: orderItems,
      amount: total,
      paymentMethod: selectedPayment,
      status: "preparing",
      usePoints: usePoints && points >= POINTS_REQUIRED,
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

    try {
      let endpoint = '';
      if (selectedPayment === PAYMENT_METHODS.STRIPE) {
        endpoint = `${url}/api/order/place`;
      } else if (selectedPayment === PAYMENT_METHODS.CASH) {
        endpoint = `${url}/api/order/create`;
      } else {
        endpoint = `${url}/api/order/place-instant`;
      }

      const response = await axios.post(endpoint, orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'token': token,
          'Content-Type': 'application/json'
        },
      });

      if (response.data.success) {
        if (selectedPayment === PAYMENT_METHODS.STRIPE) {
          const { url: checkoutUrl } = response.data;
          window.location.replace(checkoutUrl);
        } else {
          toast.success("Order placed successfully!");
          clearCart();
          navigate("/my-orders");
        }
      } else {
        toast.error(response.data.message || "Failed to place order");
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

  const handleApplyPoints = () => {
    if (points >= POINTS_REQUIRED) {
      setUsePoints(true);
      toast.success(`${DISCOUNT_PERCENT}% discount applied using ${POINTS_REQUIRED} points!`);
    } else {
      toast.error(`You need ${POINTS_REQUIRED} points to get ${DISCOUNT_PERCENT}% discount. You have ${points} points.`);
    }
  };

  const handleRemovePoints = () => {
    setUsePoints(false);
    toast.success('Points discount removed');
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 20 : 0;
  let total = subtotal + deliveryFee;

  // Apply loyalty points discount if selected
  if (usePoints && points >= POINTS_REQUIRED) {
    const discount = total * (DISCOUNT_PERCENT / 100); // 50% discount
    total -= discount;
  }

  return (
    <form onSubmit={handlePlaceOrder} className="place-order">
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
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{formatPrice(deliveryFee)}</p>
            </div>
            {usePoints && points >= POINTS_REQUIRED && (
              <div className="cart-total-details discount">
                <p>Loyalty Points Discount (50%)</p>
                <p>-{formatPrice((subtotal + deliveryFee) * 0.5)}</p>
              </div>
            )}
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{formatPrice(total)}</b>
            </div>

            <div className="loyalty-points-section">
              <div className="points-info">
                <span>Available Points: {points}</span>
                {points >= POINTS_REQUIRED && (
                  <span className="eligible">Eligible for 50% discount!</span>
                )}
              </div>
              {!usePoints ? (
                <button
                  type="button"
                  onClick={handleApplyPoints}
                  className="apply-points-btn"
                  disabled={points < POINTS_REQUIRED}
                >
                  Apply Points
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemovePoints}
                  className="remove-points-btn"
                >
                  Remove Discount
                </button>
              )}
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
            type="submit"
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