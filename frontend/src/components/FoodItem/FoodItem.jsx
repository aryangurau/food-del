import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";



const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url, prepareBuyNow } =
    useContext(StoreContext);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const handleBuyNow = () => {
      if (prepareBuyNow(id)) {
        setShowPopup(false);
        navigate("/place-order?mode=buy-now");
      }
    };

  return (
    <div className="food-item" onClick={() => setShowPopup(true)}>
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={url + "/images/" + image}
          alt=""
        />
        {!cartItems?.[id] ? (
          <img
            className="add"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(id);
            }}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter" onClick={(e) => e.stopPropagation()}>
            <img
              onClick={() => {
                removeFromCart(id);
              }}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => {
                addToCart(id);
              }}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}

      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">NPR {price.toLocaleString('en-NP')}</p>
      </div>
      {showPopup && (
        <div className="food-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="food-popup" onClick={(e) => e.stopPropagation()}>
            <div className="food-popup-content">
              <img
                className="food-popup-image"
                src={url + "/images/" + image}
                alt={name}
              />
              <div className="food-popup-info">
                <h2>{name}</h2>
                <div className="food-popup-rating">
                  <img src={assets.rating_starts} alt="" />
                </div>
                <p className="food-popup-description">{description}</p>
                <p className="food-popup-price">NPR {price.toLocaleString('en-NP')}</p>
                
                <div className="food-popup-actions">
                  {!cartItems?.[id] ? (
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(id)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="popup-counter">
                      <img
                        onClick={() => removeFromCart(id)}
                        src={assets.remove_icon_red}
                        alt=""
                      />
                      <p>{cartItems[id]}</p>
                      <img
                        onClick={() => addToCart(id)}
                        src={assets.add_icon_green}
                        alt=""
                      />
                    </div>
                  )}
                  <button 
                    className="buy-now-btn"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
              <button 
                className="close-popup"
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default FoodItem;
