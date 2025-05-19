import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { assets } from '../../assets/assets';

const Landing = () => {
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    // Initialize Intersection Observer
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Add visible class when element is in view, remove when out of view
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          // Only remove the visible class if we want animation on scroll up
          entry.target.classList.remove('visible');
        }
      });
    }, {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% of element must be visible
    });

    // Get all elements to animate
    const elements = document.querySelectorAll('.scroll-animate');
    
    // Observe each element
    elements.forEach(el => {
      observerRef.current.observe(el);
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Add index to payment partner logos for staggered animation
  useEffect(() => {
    const logos = document.querySelectorAll('.partner-logo');
    logos.forEach((logo, index) => {
      logo.style.setProperty('--index', index);
    });
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-main">
           {/* Floating Food Animations */}
           <div className="floating-food pizza" style={{ top: '10%', left: '10%' }}>
             {/* <svg viewBox="0 0 100 100" width="60" height="60">
               <circle cx="50" cy="50" r="45" fill="#ff6b6b"/>
               <circle cx="50" cy="50" r="40" fill="#ff8787"/>
               <circle cx="35" cy="35" r="8" fill="#ffd43b"/>
               <circle cx="60" cy="40" r="8" fill="#ffd43b"/>
               <circle cx="45" cy="60" r="8" fill="#ffd43b"/>
             </svg> */}
           </div>
           <div className="floating-food burger" style={{ top: '20%', right: '15%' }}>
             {/* <svg viewBox="0 0 100 100" width="60" height="60">
               <rect x="20" y="30" width="60" height="40" rx="5" fill="#ffa94d"/>
               <rect x="15" y="45" width="70" height="10" rx="5" fill="#74b816"/>
               <rect x="25" y="40" width="50" height="5" fill="#ff8787"/>
             </svg> */}
           </div>
           <div className="floating-food fries" style={{ bottom: '15%', left: '20%' }}>
             {/* <svg viewBox="0 0 100 100" width="60" height="60">
               <rect x="30" y="20" width="10" height="60" fill="#ffd43b"/>
               <rect x="45" y="20" width="10" height="60" fill="#ffd43b"/>
               <rect x="60" y="20" width="10" height="60" fill="#ffd43b"/>
               <rect x="20" y="70" width="60" height="15" rx="5" fill="#ff6b6b"/>
             </svg> */}
           </div>
        
        <div className="hero-content scroll-animate">
          <div className="hero-text scroll-animate">
            <h1>Giving your hunger</h1>
            <h2>a new option</h2>
            <p>Bid goodbye to your usual boring meals and say hello to diverse exotic options from thousands of restaurants.</p>
            <div className="hero-buttons">
              <button className="primary-btn scroll-animate" onClick={() => navigate('/home')}>
                Order Now
              </button>
              <button className="secondary-btn scroll-animate" onClick={() => navigate('/partner')}>
                Partner with us
              </button>
            </div>
          </div>
          <div className="hero-image scroll-animate">
            <img src={assets.burger} alt="Food Collage" />
          </div>
          <div className="hero-image scroll-animate">
            <img src={assets.burger} alt="Food Collage" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card scroll-animate">
          <div className="feature-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(230, 0, 25, 0.1)"/>
              <path d="M48 32h-2.2c-.4-4.2-3.9-7.5-8.2-7.5-1.1 0-2.1.2-3.1.6-.8-3-3.5-5.1-6.7-5.1-3.8 0-6.9 3.1-6.9 6.9 0 .4 0 .7.1 1.1H16c-2.2 0-4 1.8-4 4v8c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4v-8c0-2.2-1.8-4-4-4zm-20-4c1.7 0 3 1.3 3 3h-6c0-1.7 1.3-3 3-3zm7.6 4c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="#E60019"/>
              <path d="M20 36h-2c-.6 0-1-.4-1-1s.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1zm28 0h-2c-.6 0-1-.4-1-1s.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1z" fill="#E60019"/>
              <path d="M44 28h-4v-4h-4v4h-4v4h4v4h4v-4h4z" fill="#E60019"/>
            </svg>
          </div>
          <h3>Fastest Delivery</h3>
          <p>Get your food delivered quickly to your doorstep within 45 minutes! That's the fastest food you can get.</p>
        </div>

        <div className="feature-card scroll-animate">
          <div className="feature-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(230, 0, 25, 0.1)"/>
              <path d="M44 20H20c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V24c0-2.2-1.8-4-4-4zM24 36c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm16 0c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#E60019"/>
              <path d="M24 30c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#E60019"/>
              <path d="M32 26c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#E60019"/>
            </svg>
          </div>
          <h3>So Much to Choose From</h3>
          <p>Find your favorite cuisines from thousands of restaurants we offer. Anything you crave for, we have it.</p>
        </div>

        <div className="feature-card scroll-animate">
          <div className="feature-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(230, 0, 25, 0.1)"/>
              <path d="M42 22H22c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V24c0-1.1-.9-2-2-2zm-16 4h12v4H26v-4zm0 8h12v4H26v-4z" fill="#E60019"/>
              <circle cx="44" cy="24" r="8" fill="#E60019"/>
              <text x="40" y="28" fill="white" fontSize="12" fontWeight="bold">%</text>
            </svg>
          </div>
          <h3>Best offers in town</h3>
          <p>The best offers and combos at the best price you can get. Grab it before it's too late!</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title scroll-animate">How It Works</h2>
        <div className="steps-container">
          <div className="step-card scroll-animate">
            <div className="step-number">1</div>
            <div className="step-icon">
              <svg viewBox="0 0 100 100" width="60" height="60">
                <circle cx="50" cy="50" r="45" fill="#E60019" opacity="0.1"/>
                <path d="M30 50 L45 65 L70 35" stroke="#E60019" strokeWidth="8" fill="none"/>
              </svg>
            </div>
            <h3>Choose Your Food</h3>
            <p>Browse through our extensive menu of delicious meals from various cuisines</p>
          </div>

          <div className="step-connector scroll-animate">
            <svg width="100" height="20">
              <path d="M0 10 L100 10" stroke="#E60019" strokeWidth="2" strokeDasharray="5,5"/>
            </svg>
          </div>

          <div className="step-card scroll-animate">
            <div className="step-number">2</div>
            <div className="step-icon">
              <svg viewBox="0 0 100 100" width="60" height="60">
                <circle cx="50" cy="50" r="45" fill="#E60019" opacity="0.1"/>
                <path d="M35 50 A15 15 0 0 1 65 50" stroke="#E60019" strokeWidth="8" fill="none"/>
                <circle cx="50" cy="35" r="10" fill="#E60019"/>
              </svg>
            </div>
            <h3>Make Payment</h3>
            <p>Secure and easy payment with multiple options available</p>
          </div>

          <div className="step-connector scroll-animate">
            <svg width="100" height="20">
              <path d="M0 10 L100 10" stroke="#E60019" strokeWidth="2" strokeDasharray="5,5"/>
            </svg>
          </div>

          <div className="step-card scroll-animate">
            <div className="step-number">3</div>
            <div className="step-icon">
              <svg viewBox="0 0 100 100" width="60" height="60">
                <circle cx="50" cy="50" r="45" fill="#E60019" opacity="0.1"/>
                <path d="M30 50 L50 30 L70 50 L50 70 Z" stroke="#E60019" strokeWidth="8" fill="none"/>
              </svg>
            </div>
            <h3>Track Order</h3>
            <p>Real-time tracking of your order from kitchen to delivery</p>
          </div>

          <div className="step-connector scroll-animate">
            <svg width="100" height="20">
              <path d="M0 10 L100 10" stroke="#E60019" strokeWidth="2" strokeDasharray="5,5"/>
            </svg>
          </div>

          <div className="step-card scroll-animate">
            <div className="step-number">4</div>
            <div className="step-icon">
              <svg viewBox="0 0 100 100" width="60" height="60">
                <circle cx="50" cy="50" r="45" fill="#E60019" opacity="0.1"/>
                <path d="M35 50 L50 65 L65 35" stroke="#E60019" strokeWidth="8" fill="none"/>
              </svg>
            </div>
            <h3>Enjoy Food</h3>
            <p>Receive your delicious meal and enjoy the taste</p>
          </div>
        </div>
      </section>

      {/* Payment Partners Section */}
      <section className="payment-partners">
        <h2 className="section-title scroll-animate">Payment Partners</h2>
        <div className="partners-container">
          <div className="partner-logo stripe scroll-animate">
            <svg viewBox="0 0 60 25" height="25">
              <path d="M5 10.1c0-.6.6-1 1.4-1 1.2 0 2.5.4 3.4 1.2V6.5c-1.2-.5-2.4-.7-3.4-.7C3.2 5.8 1 7.4 1 10.2c0 4 5.9 3.4 5.9 5.1 0 .7-.6 1-1.5 1-1.3 0-2.9-.6-4.2-1.5v3.8c1.4.6 2.8.9 4.2.9 3.3 0 5.7-1.6 5.7-4.3.1-4.4-5.9-3.6-5.9-5.1z" fill="#6772E5"/>
            </svg>
          </div>
          <div className="partner-logo esewa scroll-animate">
            <img src={assets.esewa} alt="eSewa" />
          </div>
          <div className="partner-logo khalti scroll-animate">
            <img src={assets.khalti} alt="Khalti" />
          </div>
          <div className="partner-logo fonepay scroll-animate">
            <img src={assets.fonepay} alt="FonePay" />
          </div>
          <div className="partner-logo cod scroll-animate">
            <div className="cod-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.35 18.5C8.66 17.56 10.26 17 12 17s3.34.56 4.65 1.5c-1.31.94-2.91 1.5-4.65 1.5s-3.34-.56-4.65-1.5zm10.79-1.38C16.45 15.8 14.32 15 12 15s-4.45.8-6.14 2.12C4.7 15.73 4 13.95 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8c0 1.95-.7 3.73-1.86 5.12z" fill="#666"/>
              </svg>
            </div>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="download-app">
        <div className="download-content scroll-animate">
          <h2>Download our app</h2>
          <p>Get the best food delivery experience on your phone</p>
          <div className="app-buttons">
            <button className="app-store-btn scroll-animate">App Store</button>
            <button className="play-store-btn scroll-animate">Play Store</button>
          </div>
        </div>
        <div className="app-preview scroll-animate">
          <img src={assets.app} alt="App Preview" />
        </div>
      </section>

      {/* Partner Section */}
      <section className="partner-section">
        <h2 className="section-title scroll-animate">Join Our Platform</h2>
        <div className="partner-content">
          <div className="partner-card scroll-animate">
            <div className="partner-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.35 18.5C8.66 17.56 10.26 17 12 17s3.34.56 4.65 1.5c-1.31.94-2.91 1.5-4.65 1.5s-3.34-.56-4.65-1.5zm10.79-1.38C16.45 15.8 14.32 15 12 15s-4.45.8-6.14 2.12C4.7 15.73 4 13.95 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8c0 1.95-.7 3.73-1.86 5.12z" fill="currentColor"/>
                <path d="M12 6c-1.93 0-3.5 1.57-3.5 3.5S10.07 13 12 13s3.5-1.57 3.5-3.5S13.93 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Become a Customer</h3>
            <p>Order from your favorite restaurants and enjoy delicious meals delivered to your doorstep.</p>
            <button onClick={() => navigate('/signup')} className="action-btn">Sign Up Now</button>
          </div>

          <div className="partner-card scroll-animate">
            <div className="partner-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Restaurant Partner</h3>
            <p>Expand your business and reach more customers by joining our food delivery platform.</p>
            <button onClick={() => navigate('/restaurant/register')} className="action-btn">Partner With Us</button>
          </div>

          <div className="partner-card scroll-animate">
            <div className="partner-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v4zm13-4l3.89-6.83C21.52 4.06 20.52 3 19.2 3H4.8c-1.32 0-2.32 1.06-1.69 2.17L7 12h10z" fill="currentColor"/>
                <circle cx="9" cy="16" r="2" fill="currentColor"/>
                <circle cx="15" cy="16" r="2" fill="currentColor"/>
              </svg>
            </div>
            <h3>Delivery Partner</h3>
            <p>Join our delivery fleet and earn money by delivering food to hungry customers.</p>
            <button onClick={() => navigate('/delivery/register')} className="action-btn">Start Delivering</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;