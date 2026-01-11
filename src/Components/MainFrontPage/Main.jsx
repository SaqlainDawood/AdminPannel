// src/components/Landing/HeroLanding.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroLanding.css';

const HeroLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="landing-content">
        {/* Header */}
        <header className="Frontpage-landing-header">
          <div className="FrontPage-logo-section">
            <div className="FP-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>UMS</span>
            </div>
            <h1 className="university-name">University Management System</h1>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h2 className="hero-title">
                Welcome to <span className="gradient-text">UMS Portal</span>
              </h2>
              <p className="hero-subtitle">
                Streamlined management for modern educational institutions. 
                Choose your role to continue to the dedicated portal.
              </p>
              
              {/* Stats */}
              <div className="stats-container">
                <div className="stat-item">
                  <h3>10K+</h3>
                  <p>Students</p>
                </div>
                <div className="stat-item">
                  <h3>500+</h3>
                  <p>Faculty</p>
                </div>
                <div className="stat-item">
                  <h3>50+</h3>
                  <p>Programs</p>
                </div>
              </div>
            </div>

            {/* Role Selection Cards */}
            <div className="role-selection">
              <h3 className="selection-title">Select Your Role</h3>
              <div className="cards-container">
                {/* Admin Card */}
                <div 
                  className="role-card admin-card" 
                  onClick={() => navigate('/admin/register')}
                >
                  <div className="card-icon">
                    <i className="fas fa-crown"></i>
                  </div>
                  <h4>Administrator</h4>
                  <p>Full system access, user management, and institutional controls</p>
                  <div className="card-features">
                    <span><i className="fas fa-check"></i> System Settings</span>
                    <span><i className="fas fa-check"></i> User Management</span>
                    <span><i className="fas fa-check"></i> Analytics</span>
                  </div>
                  <button className="card-button">
                    Continue as Admin
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>

                {/* Coordinator Card */}
                <div 
                  className="role-card coordinator-card" 
                  onClick={() => navigate('/coordinator/login')}
                >
                  <div className="card-icon">
                    <i className="fas fa-users-cog"></i>
                  </div>
                  <h4>Coordinator</h4>
                  <p>Department management, student coordination, and academic oversight</p>
                  <div className="card-features">
                    <span><i className="fas fa-check"></i> Student Management</span>
                    <span><i className="fas fa-check"></i> Faculty Coordination</span>
                    <span><i className="fas fa-check"></i> Academic Planning</span>
                  </div>
                  <button className="card-button">
                    Continue as Coordinator
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>&copy; 2024 University Management System. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HeroLanding;