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
        const userData = {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role
        };
        setUser(userData);
        localStorage.setItem('userId', decodedToken.id);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    }
  };

  useEffect(() => {
    fetchUserFromToken();
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

    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Sync with backend if logged in
    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setCartItems(response.data.cartData);
          localStorage.setItem('cartItems', JSON.stringify(response.data.cartData));
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
        toast.error("Failed to sync with server. Please try again.");
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
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return newCart;
    });

    // Sync with backend if logged in
    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setCartItems(response.data.cartData);
          localStorage.setItem('cartItems', JSON.stringify(response.data.cartData));
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
        toast.error("Failed to sync with server. Please try again.");
      }
    }
  };

  const clearCart = async () => {
    setCartItems({});
    localStorage.removeItem('cartItems');

    // Clear cart in backend if user is logged in
    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/clear`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Failed to clear cart in backend:', error);
      }
    }

    toast(getRandomMessage('empty'), {
      icon: '🧹',
      style: {
        background: '#64748b15',
        border: '2px solid #64748b',
        color: '#64748b',
      },
    });
  };

  const loadCartData = async () => {
    if (!token) {
      setCartItems({});
      localStorage.removeItem('cartItems');
      return;
    }

    try {
      const response = await axios.get(`${url}/api/cart/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
        localStorage.setItem('cartItems', JSON.stringify(response.data.cartData || {}));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart data");
      setCartItems({});
      localStorage.removeItem('cartItems');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchFoodList();
        await loadCartData();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    loadInitialData();
  }, [token]); // Re-run when token changes

  // Clear cart when user logs out
  useEffect(() => {
    if (!token) {
      setCartItems({});
      localStorage.removeItem('cartItems');
    }
  }, [token]);

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((food) => food._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const formatPrice = (amount) => {
    if (typeof amount !== 'number') return 'NPR 0';
    return `NPR ${amount.toLocaleString('en-NP')}`;
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

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    clearCart,
    token,
    setToken,
    user,
    url,
    formatPrice
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
