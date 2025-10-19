import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../styles/LoginForm.css";
import skillSyncLogo from "../assets/images/SkillSync Logo Design.png";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useContext(AuthContext);
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      const response = await axios.post("http://localhost:3000/users/login", {
        email,
        password,
      });

      const token = response.data.accessToken;
      localStorage.setItem("accessToken", token);
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle unverified user
      if (
        error.response?.status === 403 &&
        error.response.data.requiresVerification
      ) {
        // Redirect to verification page with userId and email
        navigate(
          `/verify-email?userId=${
            error.response.data.userId
          }&email=${encodeURIComponent(email)}`
        );
        return;
      }

      setError(
        error.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to forgot password page
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img
            src={skillSyncLogo}
            alt="SkillSync Logo"
            className="login-logo-img"
          />
        </div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Login to Continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              name="search_email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type="password"
              name="search_password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {error && <div className="error-message">{error}</div>}

          <div className="forgot-password-section">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-link"
            >
              Forgot Password?
            </button>
          </div>

          <div className="signup-redirect">
            Don't have an account?{" "}
            <a href="/register" className="signup-link">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
