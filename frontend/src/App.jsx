import { useState, useContext, useEffect } from "react";
import { Routes, Route,useLocation, useNavigate } from "react-router-dom";
import { AppProvider } from './context/AppContext';
import { StoreContext } from './context/StoreContext';
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Offers from "./components/Offers/Offers";
import Wishlist from "./components/Wishlist/Wishlist";
import Notifications from "./components/Notifications/Notifications";
import Loyalty from "./pages/Loyalty/Loyalty";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import ComplaintBox from "./components/ComplaintBox/ComplaintBox";
import Footer from "./components/Footer/Footer";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import SearchResults from "./components/SearchResult/SearchResults";
import ChatComponent from "./components/ChatComponent/ChatComponent";
import Profile from "./pages/Profile/Profile";
import { Toaster } from 'react-hot-toast';
import VerifyForgotPassword from "./components/VerifyFp/VerifyForgotPassword"
import ResetPassword from "./components/ResetPass/ResetPassword";
import Landing from "./pages/Landing/Landing";

const App = () => {

  const [showLogin, setShowLogin] = useState(false);

  return (
    <AppProvider>
      <AppContent showLogin={showLogin} setShowLogin={setShowLogin} />
    </AppProvider>
  );
};

// Separate component to use StoreContext
const AppContent = ({ showLogin, setShowLogin }) => {
  
  const { token, user} = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();


// Check if user has visited before
useEffect(() => {
  const hasVisited = localStorage.getItem('hasVisitedBefore');
  if (hasVisited && location.pathname === '/') {
    navigate('/home');
  }
}, [location, navigate]);

  // dont Hide navbar on landing page
  const showNavbar = location.pathname == '/';



  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 80,
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
       <Navbar setShowLogin={setShowLogin} />
      {/* {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>} */}
      {/* <Navbar setShowLogin={setShowLogin} /> */}
      <div className="app">
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/my-orders" element={<MyOrders/>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/complaint" element={<ComplaintBox  userId={user.id}  />}  />
          <Route path="/verify-otp" element={<VerifyForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </div>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
  
      <Footer />
      {/* Chatbot - only show when logged in */}
      {token && <ChatComponent />}
    </>
  );
};

export default App;
