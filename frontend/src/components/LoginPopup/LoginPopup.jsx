import { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

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
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
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
                pattern="^\+?[\d\s-]{10,15}$"
                title="Please enter a valid phone number with optional country code"
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
              placeholder="Enter Password"
              required
            />
          </div>
        </div>

        <div className="showhide">
          <input type="checkbox" onClick={showHide} />
          <p>show & hide</p>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <div className="spinner"></div> : currState === "Sign Up" ? "Create account" : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
