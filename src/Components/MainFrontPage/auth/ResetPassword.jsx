import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import  { resetPassword } from "../../../services/authAPI";
import "./AuthPages.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(token, password);

      setMessage(
        response.message ||
          "Password reset successful. Please login."
      );

      setPassword("");
      setConfirmPassword("");

      // User ko login page par bhej do
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. The link may have expired."
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
          <div className="auth-icon reset-icon">
            <i className="fas fa-key"></i>
          </div>

          <h2>Reset Password</h2>

          <p className="auth-description">
            Create a new secure password for your UMS account.
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
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="password">
                New Password
              </label>

              <div className="input-wrapper">
                <i className="fas fa-lock"></i>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <i
                    className={
                      showPassword
                        ? "fas fa-eye-slash"
                        : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper">
                <i className="fas fa-lock"></i>

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  <i
                    className={
                      showConfirmPassword
                        ? "fas fa-eye-slash"
                        : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <div className="password-hint">
              <i className="fas fa-shield-alt"></i>
              Password must contain at least 6 characters.
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Reset Password
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

export default ResetPassword;