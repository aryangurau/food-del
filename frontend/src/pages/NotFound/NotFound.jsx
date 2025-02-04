import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="plate">
        <div className="burger">
          <div className="bun-top"></div>
          <div className="lettuce"></div>
          <div className="cheese"></div>
          <div className="patty"></div>
          <div className="bun-bottom"></div>
        </div>
      </div>
      <div className="not-found-content">
        <h1>4<span className="zero bounce">0</span>4</h1>
        <h2>Page Not Found</h2>
        <p>Oops! Looks like this page is as missing as a burger without a bun!</p>
        <Link to="/" className="home-button">
          <span>Back to Menu</span>
          <div className="button-icon">🍽️</div>
        </Link>
      </div>
      <div className="floating-items">
        <span className="food-item">🍕</span>
        <span className="food-item">🍔</span>
        <span className="food-item">🌮</span>
        <span className="food-item">🍟</span>
        <span className="food-item">🥤</span>
      </div>
    </div>
  );
};

export default NotFound;