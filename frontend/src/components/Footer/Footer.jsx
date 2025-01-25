import { assets } from "../../assets/assets";
import "./Footer.css";
const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.icon} alt="" className="icon" />
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore,
            itaque magni amet fugit, debitis quasi illo at maxime porro labore
            praesentium iure ea. Quisquam non quis minus quaerat necessitatibus
            totam?
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Developers</h2>
          <div className="developer-list">
            <div className="developer-item">
              <img src={assets.profile_icon} alt="Aryan Gurau" className="developer-image" />
              <span>Aryan Gurau</span>
            </div>
            <div className="developer-item">
              <img src={assets.profile_icon} alt="Kiran Devkota" className="developer-image" />
              <span>Kiran Devkota</span>
            </div>
            <div className="developer-item">
              <img src={assets.profile_icon} alt="Avishek Dawadi" className="developer-image" />
              <span>Avishek Dawadi</span>
            </div>
            <div className="developer-item">
              <img src={assets.profile_icon} alt="Shikha Shrestha" className="developer-image" />
              <span>Shikha Shrestha</span>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 @ food-delivery-app.com - All rights reserved
      </p>
    </div>
  );
};

export default Footer;
