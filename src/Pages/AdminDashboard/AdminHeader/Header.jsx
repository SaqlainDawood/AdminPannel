import React, { useState } from "react";
import {
  FaBell,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Header.css";
import {useNavigate} from 'react-router-dom'
const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = ()=>{
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      localStorage.removeItem("userRole");
      sessionStorage.clear();
      setMenuOpen(false);

      navigate('/admin/login');
  }


  return (
    <header className="admin-header shadow-sm">
      {/* Left - Page Title */}
      <div className="header-left">
        <h4>University Management</h4>
      </div>

      {/* Right - User & Actions */}
      <div className="header-right">
        <button className="icon-btn">
          <FaBell />
          <span className="badge">3</span>
        </button>
        <div className="admin-user">
          <FaUserCircle className="user-avatar" />
          <span className="admin-name">Admin</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>

        {/* Hamburger for mobile */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Dropdown Menu for Mobile */}
      {menuOpen && (
        <div className="dropdown-menu">
          {/* <button className="dropdown-item">
            <FaBell /> Notifications
          </button> */}
          <button className="dropdown-item">
            <FaUserCircle /> Profile
          </button>
        
          <button className="dropdown-item logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
