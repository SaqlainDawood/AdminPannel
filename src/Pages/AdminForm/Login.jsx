import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminAPI from '../../api'

import './AdminLogin.css'; // We'll create this CSS file

export default function AdminLogin() {
  const navigate = useNavigate();
  const [login, setLogin] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = (e) => {
    const { name, value } = e.target;
    setLogin({ ...login, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!login.email || !login.password) {
      toast.error("Please Enter the Email Login Fields!!!");
      return;
    }

    setLoading(true);
    
    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const res = await AdminAPI.post('/login', {
        email: login.email,
        password: login.password,
      });
      
      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminData", JSON.stringify(res.data.admin));
        setTimeout(() => {
          navigate('/admin/sidenav');
        }, 2000);
      } else {
        toast.error(res.data.message || "Login Failed");
      }
    } catch (error) {
      toast.error("Enter a valid Email and Password...");
      console.log("Login Error failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Background Animation */}
      <div className="login-background">
        <div className="floating-elements">
          <div className="floating-element el-1"></div>
          <div className="floating-element el-2"></div>
          <div className="floating-element el-3"></div>
          <div className="floating-element el-4"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="Admin-login-content">
        {/* Left Section - Illustration */}
        <div className="Admin-login-left">
          <div className="illustration-container">
            <div className="main-illustration">
              <div className="illustration-icon">
                <i className="fas fa-crown"></i>
              </div>
              <h2>Administrator Portal</h2>
              <p>Full system control, user management, and institutional oversight with complete administrative privileges.</p>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <i className="fas fa-users-cog"></i>
                <span>System Administration</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chart-bar"></i>
                <span>Analytics & Reports</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Security Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-cog"></i>
                <span>System Configuration</span>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="admin-stats">
              <div className="stat-item">
                <h3>Full</h3>
                <p>System Access</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>Control</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>Monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="login-right">
          <div className="login-form-container">
            {/* Header */}
            <div className="form-header">
              <div className="logo">
                <i className="fas fa-graduation-cap"></i>
                <span>UMS Admin</span>
              </div>
              <h1>Administrator Access</h1>
              <p>Secure system administration login</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Administrator Email</label>
                <div className="input-container">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={login.email}
                    onChange={handleClick}
                    placeholder="admin@university.edu"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Administrator Password</label>
                <div className="input-container">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={login.password}
                    onChange={handleClick}
                    placeholder="Enter your secure password"
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember this device
                </label>
                <Link to="/admin/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-button admin-login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Access Admin Dashboard
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="security-notice">
                <i className="fas fa-info-circle"></i>
                <span>This portal contains sensitive system information. Ensure you are authorized.</span>
              </div>

              {/* Back to Home */}
              <div className="back-home-section">
                <Link to="/" className="back-home-link">
                  <i className="fas fa-arrow-left"></i>
                  Back to Home Page
                </Link>
              </div>
            </form>

            {/* Security Footer */}
            <div className="security-footer">
              <i className="fas fa-shield-alt"></i>
              <span>Protected by advanced encryption & multi-layer security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}