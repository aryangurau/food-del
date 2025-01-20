import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Footer from "./components/Footer/Footer";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import SearchResults from "./components/SearchResult/SearchResults";
import ChatComponent from "./components/ChatComponent/ChatComponent";
import { Toaster } from 'react-hot-toast';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          // Default options for all toasts
          className: '',
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            maxWidth: '400px',
            fontWeight: '500',
          },
          // Custom success toast style
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
            style: {
              background: '#22c55e15',
              border: '2px solid #22c55e',
              color: '#22c55e',
            },
          },
          // Custom error toast style
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef444415',
              border: '2px solid #ef4444',
              color: '#ef4444',
            },
          },
        }}
      />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders/>} />
        </Routes>
      </div>
      <Footer />
      {/* Chatbot */}
      <ChatComponent />
    </>
  );
};

export default App;
