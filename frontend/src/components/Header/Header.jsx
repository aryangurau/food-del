
import { assets } from "../../assets/assets";
import "./Header.css";

const Header = () => {
  const menu = () => {
    alert("menu is under maintenance");
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
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes
          crafter with the finest ingredients
        </p>
        <button onClick={menu}>View Menu</button>
      </div>
    </div>
  );
};

export default Header;
