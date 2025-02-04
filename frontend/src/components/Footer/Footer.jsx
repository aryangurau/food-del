import { assets } from "../../assets/assets";
import { FaPhone, FaEnvelope } from 'react-icons/fa';
import "./Footer.css";
const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.icon} alt="" className="icon" />
          <p>
            Welcome to Pathao Khaja, your premier food delivery destination, bringing delicious meals right to 
            your doorstep. With real-time tracking, secure payments, and a wide selection 
            of cuisines, we ensure a seamless dining experience. Our commitment to quality 
            service and customer satisfaction makes us your trusted partner in food delivery.
          </p>
          <div className="footer-contact">
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+977 9809241991</span>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>foodapp@gmail.com</span>
            </div>
          </div>
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
              <img src={assets.aryan} alt="Aryan Gurau" className="developer-image" />
              <span>Aryan Gurau</span>
            </div>
            <div className="developer-item">
              <img src={assets.kiran} alt="Kiran Devkota" className="developer-image" />
              <span>Kiran Devkota</span>
            </div>
            <div className="developer-item">
              <img src={assets.avishek} alt="Avishek Dawadi" className="developer-image" />
              <span>Avishek Dawadi</span>
            </div>
            <div className="developer-item">
              <img src={assets.shikha} alt="Shikha Shrestha" className="developer-image" />
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
