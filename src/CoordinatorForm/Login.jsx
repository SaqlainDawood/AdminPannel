// src/components/Coordinator/CoordinatorLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './CoordinatorLogin.css';

const CoordinatorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call - replace with your actual API
      const response = await fetch('http://localhost:8000/api/coordinator/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Login successful!');
        localStorage.setItem('coordinatorToken', data.token);
        localStorage.setItem('coordinatorData', JSON.stringify(data.coordinator));
        navigate('/coordinator/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coordinator-login-container">
      {/* Background Design */}
      <div className="login-background">
        <div className="floating-elements">
          <div className="floating-element el-1"></div>
          <div className="floating-element el-2"></div>
          <div className="floating-element el-3"></div>
          <div className="floating-element el-4"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="MCoord-login-content">
        {/* Left Section - Illustration */}
        <div className="login-left">
          <div className="illustration-container">
            <div className="main-illustration">
              <div className="illustration-icon">
                <i className="fas fa-users-cog"></i>
              </div>
              <h2>Academic Coordinator Portal</h2>
              <p>Manage your department, students, and academic activities with precision and efficiency.</p>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <i className="fas fa-user-graduate"></i>
                <span>Student Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Faculty Coordination</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-calendar-check"></i>
                <span>Academic Planning</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chart-line"></i>
                <span>Performance Analytics</span>
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
                <span>UMS Coordinator</span>
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your coordinator account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-container">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your institutional email"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
                  Remember me
                </label>
                <Link to="/coordinator/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Sign In to Dashboard
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Alternative Options */}
              <div className="alternative-options">
                <p>Don't have coordinator access?</p>
                <div className="option-buttons">
                  <button type="button" className="alt-button contact-admin">
                    <i className="fas fa-headset"></i>
                    Contact Administrator
                  </button>
                  <Link to="/" className="alt-button back-home">
                    <i className="fas fa-home"></i>
                    Back to Home
                  </Link>
                </div>
              </div>
            </form>

            {/* Security Footer */}
            <div className="security-footer">
              <i className="fas fa-shield-alt"></i>
              <span>Secure login protected by encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorLogin;