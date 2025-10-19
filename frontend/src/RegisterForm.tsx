import axios from "axios";
import { useState } from "react";
import "./styles/RegisterForm.css";
import skillSyncLogo from "./assets/images/SkillSync Logo Design.png";
import OTPVerification from "./components/OTPVerification";

function RegisterForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [userId, setUserId] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Send as JSON instead of FormData
    const userData = {
      name,
      email,
      password,
      profilePicture: "", // Empty for now, user can add later
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        userData,
        {
          headers: {
            "Content-Type": "application/json", // Send as JSON
          },
        }
      );

      // Show OTP verification screen
      setUserId(response.data.userId);
      setExpiresIn(response.data.expiresIn);
      setShowOTP(true);
    } catch (error: any) {
      console.log("error => ", error);
      const errorMessage = error?.response?.data?.error || "An error occurred";
      console.error("Registration error:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If OTP verification is needed, show OTP component
  if (showOTP) {
    return (
      <OTPVerification userId={userId} email={email} expiresIn={expiresIn} />
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-logo">
          <img
            src={skillSyncLogo}
            alt="SkillSync Logo"
            className="register-logo-img"
          />
        </div>
        <h1 className="register-title">Join Us Today</h1>
        <p className="register-subtitle">Create your account</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name:
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              name="email"
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
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
              required
            />
          </div>

          {/* Remove profile picture upload for now */}
          <div className="form-group">
            <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
              You can add a profile picture after registration in your profile
              settings.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="register-button"
          >
            {isLoading ? (
              <>
                <span className="button-loader"></span>
                Sending Verification Code...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
