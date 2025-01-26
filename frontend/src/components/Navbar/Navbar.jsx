import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import FoodDecoration from '../FoodDecoration/FoodDecoration';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken, url, user } = useContext(StoreContext);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.hamburger-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      setIsSearchActive(false);
      setIsProfileOpen(false);
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsProfileOpen(false);
    navigate("/");
    setShowLogin(true);
  };

  const handleSearchIconClick = () => {
    setIsSearchActive((prev) => !prev);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await axios.get(`${url}/api/food/search?query=${searchQuery}`);
        if (response.status === 200) {
          const data = response.data;
          if (data.success) {
            navigate(`/search?query=${searchQuery}`, { state: { results: data.data } });
            setIsSearchActive(false);
            setIsMobileMenuOpen(false);
          }
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    }
  };

  const handleMenuClick = (menuItem) => {
    setMenu(menuItem);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="navbar-container">
      <FoodDecoration />
      <div className="navbar">
        <Link to="/" onClick={() => handleMenuClick("home")}>
          <img src={assets.icon} alt="" className="logo" />
        </Link>

        <ul className="navbar-menu">
          <Link
            to="/"
            onClick={() => handleMenuClick("home")}
            className={menu === "home" ? "active" : ""}
          >
            Home
          </Link>
          <a
            href="#explore-menu"
            onClick={() => handleMenuClick("menu")}
            className={menu === "menu" ? "active" : ""}
          >
            Menu
          </a>
          <a
            href="#app-download"
            onClick={() => handleMenuClick("mobile-app")}
            className={menu === "mobile-app" ? "active" : ""}
          >
            Mobile App
          </a>
          <a
            href="#footer"
            onClick={() => handleMenuClick("contact-us")}
            className={menu === "contact-us" ? "active" : ""}
          >
            Contact Us
          </a>
        </ul>

        <div 
          className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`} 
          onClick={toggleMobileMenu}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div 
          ref={mobileMenuRef}
          className={`navbar-right ${isMobileMenuOpen ? "open" : ""}`}
        >
          {/* Mobile Navigation Menu */}
          <div className="mobile-nav-menu">
            <Link
              to="/"
              onClick={() => handleMenuClick("home")}
              className={menu === "home" ? "active" : ""}
            >
              Home
            </Link>
            <a
              href="#explore-menu"
              onClick={() => handleMenuClick("menu")}
              className={menu === "menu" ? "active" : ""}
            >
              Menu
            </a>
            <a
              href="#app-download"
              onClick={() => handleMenuClick("mobile-app")}
              className={menu === "mobile-app" ? "active" : ""}
            >
              Mobile App
            </a>
            <a
              href="#footer"
              onClick={() => handleMenuClick("contact-us")}
              className={menu === "contact-us" ? "active" : ""}
            >
              Contact Us
            </a>
          </div>

          <div className="navbar-search">
            <img
              src={assets.search_icon}
              alt=""
              onClick={handleSearchIconClick}
              className="navbar-search-icon"
            />
            {isSearchActive && (
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="navbar-search-input"
                  autoFocus
                />
                <button onClick={handleSearch} className="search-btn">
                  Search
                </button>
              </div>
            )}
          </div>

          <div className="navbar-cart">
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={assets.basket_icon} alt="" />
              {getTotalCartAmount() > 0 && <div className="dot"></div>}
            </Link>
          </div>

          <div className="navbar-notification">
            <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="notification-icon"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </Link>
          </div>

          {!token ? (
            <button onClick={() => {
              setShowLogin(true);
              setIsMobileMenuOpen(false);
            }}>
              Sign In
            </button>
          ) : (
            <div 
              ref={profileRef}
              className={`navbar-profile ${isProfileOpen ? "active" : ""}`}
              onClick={toggleProfile}
            >
              <p className="welcome-message">Welcome, {user?.name || "User"}</p>
              <img src={assets.profile_icon} alt="" />
              <ul className={`nav-profile-dropdown ${isProfileOpen ? "show" : ""}`}>
                <li onClick={() => {
                  navigate("/my-orders");
                  setIsMobileMenuOpen(false);
                  setIsProfileOpen(false);
                }}>
                  <img src={assets.bag_icon} alt="" />
                  <p>Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" />
                  <p>Logout</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
