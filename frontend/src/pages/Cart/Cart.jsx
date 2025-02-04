import { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import LoginPopup from "../../components/LoginPopup/LoginPopup";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, formatPrice, url, token } = useContext(StoreContext);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!token) {
      setShowLoginPopup(true);
    } else {
      navigate("/order");
    }
  };
  // Calculate totals
  const calculateSubtotal = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((food) => food._id === item);
        if (itemInfo) {
          total += itemInfo.price * cartItems[item];
        }
      }
    }
    return total;
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="cart">
      {showLoginPopup && (
  <LoginPopup
    setShowLogin={setShowLoginPopup}
  />
)}
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img src={url+"/images/"+item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{formatPrice(item.price)}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>{formatPrice(item.price * cartItems[item._id])}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    X
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="cart-bottom">
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
              <h3>Total</h3>
              <h3>{formatPrice(total)}</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>Proceed To Checkout</button>
          </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode , Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
