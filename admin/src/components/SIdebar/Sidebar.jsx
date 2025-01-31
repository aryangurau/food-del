import { assets } from "../../assets/assets";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/dashboard" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to="/add" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/list" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/orders" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to="/users" className="sidebar-option">
          <img src={assets.profile_image} alt="" />
          <p>Users</p>
        </NavLink>

        <NavLink to="/complaint" className="sidebar-option">
          <img src={assets.parcel_icon} alt="" />
          <p>Complaint box</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
