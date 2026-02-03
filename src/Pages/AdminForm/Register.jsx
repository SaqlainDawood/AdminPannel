import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminAPI from '../../api';
import './AdminRegister.css'; // New CSS file with unique class names

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPass, setConfirmShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePass = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPass = () => {
    setConfirmShowPass(!confirmShowPass);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.info("Password do not match. Please rewrite same password");
      return;
    }

    setLoading(true);
    
    try {
      const res = await AdminAPI.post('/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      if (res.data.success) {
        toast.success("Admin Registered Successfully, Redirecting to Login");
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!!!!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      {/* Background Animation */}
      <div className="register-background">
        <div className="register-floating-elements">
          <div className="register-element reg-el-1"></div>
          <div className="register-element reg-el-2"></div>
          <div className="register-element reg-el-3"></div>
          <div className="register-element reg-el-4"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="register-content">
        {/* Left Section - Illustration */}
        <div className="register-left">
          <div className="register-illustration-container">
            <div className="register-main-illustration">
              <div className="register-illustration-icon">
                <i className="fas fa-user-shield"></i>
              </div>
              <h2>Create Admin Account</h2>
              <p>Setup a new administrator account with full system privileges and access controls.</p>
            </div>
            
            <div className="register-features-list">
              <div className="register-feature-item">
                <i className="fas fa-crown"></i>
                <span>Full System Access</span>
              </div>
              <div className="register-feature-item">
                <i className="fas fa-users-cog"></i>
                <span>User Management</span>
              </div>
              <div className="register-feature-item">
                <i className="fas fa-chart-bar"></i>
                <span>Analytics Dashboard</span>
              </div>
              <div className="register-feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Security Controls</span>
              </div>
            </div>

            {/* Admin Privileges */}
            <div className="admin-privileges">
              <h4>Administrator Privileges</h4>
              <ul>
                <li>Full system configuration access</li>
                <li>User account management</li>
                <li>System analytics and reports</li>
                <li>Security and permission settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Section - Registration Form */}
        <div className="register-right">
          <div className="register-form-container">
            {/* Header */}
            <div className="register-form-header">
              <div className="register-logo">
                <i className="fas fa-graduation-cap"></i>
                <span>UMS Admin Setup</span>
              </div>
              <h1>Create Admin Account</h1>
              <p>Setup your administrator credentials</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Name Field */}
              <div className="register-form-group">
                <label htmlFor="name">Full Name</label>
                <div className="register-input-container">
                  <i className="fas fa-user input-icon-register"></i>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="register-form-input"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="register-form-group">
                <label htmlFor="email">Institutional Email</label>
                <div className="register-input-container">
                  <i className="fas fa-envelope input-icon-register"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@university.edu"
                    required
                    className="register-form-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="register-form-group">
                <label htmlFor="password">Admin Password</label>
                <div className="register-input-container">
                  <i className="fas fa-lock input-icon-register"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    className="register-form-input"
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={togglePass}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="register-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="register-input-container">
                  <i className="fas fa-lock input-icon-register"></i>
                  <input
                    type={confirmShowPass ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="register-form-input"
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={toggleConfirmPass}
                  >
                    <i className={`fas ${confirmShowPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="password-requirements">
                <h5>Password Requirements:</h5>
                <ul>
                  <li>Minimum 8 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="register-button admin-register-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Create Admin Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="register-login-link">
                <p>Already have an admin account?</p>
                <Link to="/admin/login" className="register-login-button">
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In to Existing Account
                </Link>
              </div>
            </form>

            {/* Security Footer */}
            <div className="register-security-footer">
              <i className="fas fa-shield-alt"></i>
              <span>All administrator accounts require verification and approval</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;