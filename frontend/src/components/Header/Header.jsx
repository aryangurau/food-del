import { useState, useContext } from "react";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import "./Header.css";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { cartItems, addToCart, removeFromCart, food_list, url } = useContext(StoreContext);

  const handleMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleAddToCart = (itemId) => {
    addToCart(itemId);
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  return (
    <div className="header">
      <div className="slider">
        <div className="slides">
          {/* Slide 1 */}
          <div className="slide">
            <img src={assets.retro} alt="" />
          </div>
          {/* Slide 2 */}
          <div className="slide">
            <img src={assets.banner2} alt="" />
          </div>
          {/* Slide 3 */}
          <div className="slide">
            <img src={assets.header_banner} alt="" />
          </div>
        </div>
      </div>

      <div className="header-contents">
        <h2>Your Perfect Meal is Just a Click Away</h2>
        <p>
          Discover a wide variety of mouth-watering dishes created using carefully
          sourced ingredients
        </p>
        <button onClick={handleMenu}>View Menu</button>
      </div>

      {/* Menu Popup */}
      {showMenu && (
        <div className="menu-overlay">
          <div className="menu-popup">
            <div className="menu-header">
              <h2>Our Menu</h2>
              <button className="close-btn" onClick={handleCloseMenu}>×</button>
            </div>
            <div className="menu-items">
              {food_list.map((item) => (
                <div key={item._id} className="menu-item">
                  <div className="menu-item-img-container">
                    <img src={url + "/images/" + item.image} alt={item.name} />
                    <div className="food-item-controls">
                      {!cartItems[item._id] ? (
                        <img
                          className="add"
                          onClick={() => handleAddToCart(item._id)}
                          src={assets.add_icon_white}
                          alt="Add to cart"
                        />
                      ) : (
                        <div className="food-item-counter">
                          <img
                            onClick={() => handleRemoveFromCart(item._id)}
                            src={assets.remove_icon_red}
                            alt="Remove"
                            className="counter-button"
                          />
                          <p>{cartItems[item._id]}</p>
                          <img
                            onClick={() => handleAddToCart(item._id)}
                            src={assets.add_icon_green}
                            alt="Add"
                            className="counter-button"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    <p className="price">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
