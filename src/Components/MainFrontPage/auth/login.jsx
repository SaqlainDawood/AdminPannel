  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaSignInAlt,
    FaSpinner,
  } from "react-icons/fa";
  import { toast } from "react-toastify";
  import { loginUser } from "../../../services/authAPI";
  import "./HeroLanding.css";

  const HeroLanding = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // =========================================
    // INPUT CHANGE
    // =========================================
    const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };


// =========================================
// LOGIN
// =========================================
const handleSubmit = async (e) => {
  e.preventDefault();

  const email = formData.email.trim();
  const password = formData.password;

  // Validation
  if (!email) {
    toast.error("Email is required");
    return;
  }

  if (!password) {
    toast.error("Password is required");
    return;
  }

  try {
    setLoading(true);

    // =========================================
    // CALL LOGIN API
    // =========================================
    const response = await loginUser({
      email,
      password,
    });

    // =========================================
    // API ERROR RESPONSE
    // =========================================
    if (!response?.success) {
      toast.error(response?.message || "Login failed");
      return;
    }

    // =========================================
    // SAVE JWT IN STORAGE (common keys for all API clients)
    // =========================================
    if (response?.token) {
      const token = response.token;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("adminToken", token);
      localStorage.setItem("token", token);
      localStorage.setItem("adminToken", token);
    }

    // =========================================
    // SAVE USER IN SESSION STORAGE
    // =========================================
    if (response?.user) {
      sessionStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );
    }

    // =========================================
    // SUCCESS
    // =========================================
    toast.success("Login successful!");

    // =========================================
    // REDIRECT TO PROTECTED DASHBOARD
    // =========================================
    navigate("/admin/dashboard", {
      replace: true,
    });

  } catch (error) {
    console.error("Login error:", error);

    const message =
      error?.response?.data?.message ||
      "Unable to login. Please try again.";

    toast.error(message);

  } finally {
    setLoading(false);
  }
};


    return (
      <div className="landing-container">

        {/* =========================================
            BACKGROUND ANIMATION
        ========================================= */}
        <div className="background-animation">
          <div className="floating-shapes">

            <div className="shape shape-1"></div>

            <div className="shape shape-2"></div>

            <div className="shape shape-3"></div>

            <div className="shape shape-4"></div>

          </div>
        </div>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}
        <div className="landing-content">

          {/* =========================================
              HEADER
          ========================================= */}
          <header className="Frontpage-landing-header">

            <div className="FrontPage-logo-section">

              <div className="FP-logo">

                <i className="fas fa-graduation-cap"></i>

                <span>UMS</span>

              </div>

              <h1 className="university-name">
                University Management System
              </h1>

            </div>

          </header>

          {/* =========================================
              HERO SECTION
          ========================================= */}
          <section className="hero-section">

            <div className="hero-content">

              {/* =====================================
                  LEFT SIDE
              ===================================== */}
              <div className="hero-text">

                <h2 className="hero-title">

                  Welcome to{" "}

                  <span className="gradient-text">
                    UMS Portal
                  </span>

                </h2>

                <p className="hero-subtitle">

                  Streamlined management for modern
                  educational institutions. Access your
                  university management portal securely
                  and efficiently.

                </p>

                {/* =====================================
                    STATS
                ===================================== */}
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

              {/* =====================================
                  RIGHT SIDE LOGIN
              ===================================== */}
              <div className="ums-login-panel">

                {/* LOGIN HEADER */}
                <div className="ums-login-header">

                  <div className="ums-login-icon">

                    <i className="fas fa-user"></i>

                  </div>

                  <h2>
                    Welcome Back
                  </h2>

                  <p>
                    Sign in to your UMS account to continue
                  </p>

                </div>

                {/* LOGIN FORM */}
                <form
                  className="ums-login-form"
                  onSubmit={handleSubmit}
                >

                  {/* =================================
                      EMAIL
                  ================================= */}
                  <div className="ums-form-group">

                    <label htmlFor="login-email">
                      Email Address
                    </label>

                    <div className="ums-input-wrapper">

                      <FaEnvelope className="ums-input-icon" />

                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={loading}
                      />

                    </div>

                  </div>

                  {/* =================================
                      PASSWORD
                  ================================= */}
                  <div className="ums-form-group">

                    <label htmlFor="login-password">
                      Password
                    </label>

                    <div className="ums-input-wrapper">

                      <FaLock className="ums-input-icon" />

                      <input
                        id="login-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                      />

                      <button
                        type="button"
                        className="ums-password-toggle"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showPassword ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}

                      </button>

                    </div>

                  </div>

                  {/* =================================
                      LOGIN OPTIONS
                  ================================= */}
                  <div className="ums-login-options">

                    <label className="ums-remember">

                      <input
                        type="checkbox"
                        disabled={loading}
                      />

                      <span>
                        Remember me
                      </span>

                    </label>

                    <button
                      type="button"
                      className="ums-forgot"
                    onClick={() => navigate("/forgot-password")}
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>

                  </div>

                  {/* =================================
                      LOGIN BUTTON
                  ================================= */}
                  <button
                    type="submit"
                    className="ums-login-button"
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <FaSpinner className="ums-login-spinner" />

                        <span>
                          Signing In...
                        </span>
                      </>
                    ) : (
                      <>
                        <FaSignInAlt />

                        <span>
                          Sign In
                        </span>
                      </>
                    )}

                  </button>

                </form>

                {/* LOGIN FOOTER */}
                <div className="ums-login-footer">

                  <span>
                    University Management System
                  </span>

                  <span>•</span>

                  <span>
                    Secure Login
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =========================================
              FOOTER
          ========================================= */}
          <footer className="landing-footer">

            <p>
              &copy; 2024 University Management System.
              All rights reserved.
            </p>

            <div className="footer-links">

              <a href="#privacy">
                Privacy Policy
              </a>

              <a href="#terms">
                Terms of Service
              </a>

              <a href="#contact">
                Contact Support
              </a>

            </div>

          </footer>

        </div>

      </div>
    );
  };

  export default HeroLanding;