import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';

export const StoreContext = createContext(null);

const getRandomMessage = (type, itemName) => {
  const messages = {
    add: [
      `🎉 ${itemName} added to your feast!`,
      `🛒 ${itemName} is in your cart!`,
      `✨ Great choice! Added ${itemName}`,
      `🌟 ${itemName} added to cart`,
    ],
    addMore: [
      `🔥 Another ${itemName}? Great choice!`,
      `👌 Added one more ${itemName}`,
      `🎯 ${itemName} quantity increased`,
      `➕ Added another ${itemName}`,
    ],
    remove: [
      `👋 Removed ${itemName} from cart`,
      `🗑️ ${itemName} removed`,
      `✖️ Removed ${itemName}`,
      `📦 ${itemName} taken out`,
    ],
    empty: [
      "Cart is now empty!",
      "All items removed from cart",
      "Starting fresh with an empty cart",
    ],
  };
  const list = messages[type];
  return list[Math.floor(Math.random() * list.length)];
};

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [food_list, setFoodList] = useState([]);
  const [user, setUser] = useState(null);

  const fetchUserFromToken = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id,
          name: decodedToken.name,
        });
      } catch (error) {
        console.error("Failed to decode token:", error);
        toast.error("Session expired. Please login again.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserFromToken();
    }
  }, [token]);

  const addToCart = async (itemId) => {
    const item = food_list.find(item => item._id === itemId);
    
    // Initialize or increment cart item
    if (!cartItems[itemId] || cartItems[itemId] <= 0) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
      toast.success(getRandomMessage('add', item.name));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      toast.success(getRandomMessage('addMore', item.name));
    }

    if (token) {
      try {
        await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        toast.error("Failed to sync cart. Please try again.");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const item = food_list.find(item => item._id === itemId);
    
    // Check if item exists in cart
    if (!cartItems[itemId]) {
      return;
    }

    // Decrease quantity
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId]; // Remove item if quantity would be 0
        toast(getRandomMessage('remove', item.name), {
          icon: '🗑️',
          style: {
            background: '#ef444415',
            border: '2px solid #ef4444',
            color: '#ef4444',
          },
        });
      }
      return newCart;
    });

    // Sync with backend
    if (token) {
      try {
        await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        toast.error("Failed to sync cart. Please try again.");
      }
    }
  };

  const clearCart = () => {
    setCartItems({});
    toast(getRandomMessage('empty'), {
      icon: '🧹',
      style: {
        background: '#64748b15',
        border: '2px solid #64748b',
        color: '#64748b',
      },
    });
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) { 
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
    clearCart,
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
