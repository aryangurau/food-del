import { useState } from "react";
import { assets, food_list } from "../../assets/assets";
import "./Header.css";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
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
              {food_list.map((item, index) => (
                <div key={index} className="menu-item">
                  <img src={item.image} alt={item.name} />
                  <h3>{item.name}</h3>
                  <p className="price">₹{item.price.toFixed(2)}</p>
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
