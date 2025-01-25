import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="navbar">
      <img className="logo" src={assets.icon} alt="" />
      <div className="navbar-right">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        <img className="profile" src={assets.profile_image} alt="" />
      </div>
    </div>
  );
};

export default Navbar;
