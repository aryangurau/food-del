import { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import ForgotPassword from "../ForgotPassword/ForgotPassword";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false); // Loading state

  const showHide = () => {
    const currentPw = document.getElementById("myPassword");
    currentPw.type = currentPw.type === "password" ? "text" : "password";
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true); // Show spinner
    let newUrl = currState === "Login" ? `${url}/api/user/login` : `${url}/api/user/register`;

    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        // Store token
        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token);

        // Store user data
        const userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.phone,
          id: response.data.user._id
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // Initialize loyalty points if not exists
        if (!localStorage.getItem("loyaltyPoints")) {
          localStorage.setItem("loyaltyPoints", "0");
        }

        setShowLogin(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <div className="input-container">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={data.name}
                onChange={onChangeHandler}
                required
              />
              
            </div>
          )}
          {currState === "Sign Up" && (
            <div className="input-container">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (e.g., +977 98XXXXXXXX)"
                value={data.phone}
                onChange={onChangeHandler}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
                required
              />
            </div>
          )}
          <div className="input-container">
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="input-container">
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              id="myPassword"
              placeholder="Enter password"
              required
            />
            <div className="show-hide-password">
              <input type="checkbox" id="showPassword" onClick={showHide} />
              <label htmlFor="showPassword">Show/Hide Password</label>
            </div>
          </div>
        </div>

{/* Add this before your login button */}
<button 
  type="button" 
  className="forgot-password-btn" 
  onClick={() => setShowForgotPassword(true)}
>
  Forgot Password?
</button>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : currState === "Sign Up" ? "Create account" : "Login"}
        </button>

        <div className="terms-privacy">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">By continuing, I agree to the terms of use & privacy policy</label>
        </div>

        <p className="toggle-state">
          {currState === "Login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setCurrState(currState === "Login" ? "Sign Up" : "Login")}>
            {currState === "Login" ? "Create Account" : "Login here"}
          </span>
        </p>
      </form>
      {showForgotPassword && (
      <ForgotPassword setShowForgotPassword={setShowForgotPassword} />
    )}
    </div>
  );
};

export default LoginPopup;
