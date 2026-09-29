import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../services/authAPI";
import "./AuthPages.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      setMessage(
        response.message ||
          "If the email exists, a reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-background">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
      </div>

      <div className="auth-container">
        {/* Header */}
        <div className="auth-brand">
          <div className="auth-logo">
            <i className="fas fa-graduation-cap"></i>
          </div>

          <div>
            <h1>UMS</h1>
            <p>University Management System</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-icon forgot-icon">
            <i className="fas fa-lock"></i>
          </div>

          <h2>Forgot Password?</h2>

          <p className="auth-description">
            Don't worry. Enter your registered email address and
            we'll send you a link to reset your password.
          </p>

          {message && (
            <div className="auth-alert auth-success">
              <i className="fas fa-check-circle"></i>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert auth-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            className="back-login-btn"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Login
          </button>
        </div>

        <div className="auth-footer">
          <p>
            © 2024 University Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;