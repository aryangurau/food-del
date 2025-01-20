import { createContext, useEffect, useState } from "react";
// import { food_list } from "../assets/assets";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem('token'));
  // const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [user, setUser] = useState(null); // Add state for user info

  const fetchUserFromToken = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode token to get user details
        setUser({
          id: decodedToken.id,
          name: decodedToken.name,
        });
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  };
  useEffect(() => {
    if (token) {
      fetchUserFromToken(); // Decode token and set user on initial load
    }
  }, [token]);
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) { // Check if itemInfo exists
          totalAmount += itemInfo.price * cartItems[item];
        } else {
          console.warn(`Product with ID ${item} not found in food_list`);
        }
      }
    }
    return totalAmount;
  };

  //Fetching food list from database
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        console.error("Failed to fetch food list:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };
  const loadCartData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };
  // useEffect(() => {
  //   console.log("cartItems:", cartItems);
  //   console.log("food_list:", food_list);
  // }, [cartItems, food_list]);

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }

    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    user, 
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
