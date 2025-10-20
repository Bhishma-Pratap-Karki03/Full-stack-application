import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";
import skillSyncLogo from "../assets/images/SkillSync Logo Design.png";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/forgot-password",
        { email }
      );

      // Check if user exists using the new userExists flag
      if (response.data.userExists === false) {
        // User doesn't exist - show appropriate error message
        setError(
          "No account found with this email address. Please check the email or create a new account."
        );
      } else if (response.data.userId) {
        // User exists and OTP sent - show success and redirect
        setSuccess("Reset code has been sent to your email");

        // Navigate to OTP verification page with email AND userId
        setTimeout(() => {
          navigate(
            `/reset-password-otp?email=${encodeURIComponent(email)}&userId=${
              response.data.userId
            }`
          );
        }, 1500);
      } else {
        // Fallback - should not normally happen
        setSuccess(response.data.message);
      }
    } catch (error: any) {
      // Handle other errors (network issues, server errors, etc.)
      setError(
        error.response?.data?.error ||
          "Failed to send reset code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-logo">
          <img
            src={skillSyncLogo}
            alt="SkillSync Logo"
            className="forgot-password-logo-img"
          />
        </div>
        <h1 className="forgot-password-title">Reset Your Password</h1>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you a code to reset your
          password
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address:
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="recover-button">
            {isLoading ? "Sending Code..." : "Send Reset Code"}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="back-to-login">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="back-button"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
