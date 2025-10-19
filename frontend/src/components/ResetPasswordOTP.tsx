import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/ResetPasswordOTP.css";
import skillSyncLogo from "../assets/images/SkillSync Logo Design.png";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ResetPasswordOTP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const userIdFromUrl = searchParams.get("userId") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string>(userIdFromUrl);
  const [step, setStep] = useState<"otp" | "password">("otp");
  const navigate = useNavigate();

  // Get stored expiry time on component mount
  useEffect(() => {
    const storedExpiry = localStorage.getItem(`otpExpiry_${email}`);
    if (storedExpiry) {
      const expiryTime = parseInt(storedExpiry);
      const now = Date.now();
      const remainingTime = Math.max(0, Math.floor((expiryTime - now) / 1000));

      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
      } else {
        // Clear expired storage
        localStorage.removeItem(`otpExpiry_${email}`);
      }
    }
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      // Clear storage when timer expires
      localStorage.removeItem(`otpExpiry_${email}`);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, email]);

  // Store expiry time when we get a new OTP
  const storeExpiryTime = (expiresIn: number) => {
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(`otpExpiry_${email}`, expiryTime.toString());
    setTimeLeft(expiresIn);
  };

  // Handle OTP input change
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  // Handle key events for OTP
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Get userId from email if not in URL
  const getUserIdByEmail = async (): Promise<string> => {
    if (userId) return userId;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/check-verification`,
        { email }
      );

      if (response.data.userId) {
        setUserId(response.data.userId);
        return response.data.userId;
      }
      throw new Error("User ID not found");
    } catch (error) {
      console.error("Error getting user ID:", error);
      throw error;
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      // Get userId (from URL or by email lookup)
      const userUserId = await getUserIdByEmail();

      // Verify the reset OTP
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify-reset-otp`,
        {
          userId: userUserId,
          otp: otpString,
        }
      );

      if (response.data.verified) {
        // Clear the stored expiry time when OTP is verified
        localStorage.removeItem(`otpExpiry_${email}`);
        setStep("password");
        setSuccess("Code verified! Now set your new password.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(
        error.response?.data?.error ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const otpString = otp.join("");

    try {
      // Get userId (from URL or by email lookup)
      const userUserId = await getUserIdByEmail();

      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        userId: userUserId,
        otp: otpString,
        newPassword,
      });

      // Clear all stored data on successful password reset
      localStorage.removeItem(`otpExpiry_${email}`);

      setSuccess("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        error.response?.data?.error ||
          "Password reset failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );

      // Update userId if we get it from the response
      if (response.data.userId) {
        setUserId(response.data.userId);
      }

      // Store new expiry time
      if (response.data.expiresIn) {
        storeExpiryTime(response.data.expiresIn);
      } else {
        storeExpiryTime(600); // Default 10 minutes
      }

      setOtp(["", "", "", "", "", ""]);
      setSuccess("New verification code sent to your email!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Failed to resend verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Clear stored data when component unmounts or when leaving page
  useEffect(() => {
    return () => {
      // Only clear if we're not in password step (keep it for refresh during password step)
      if (step === "otp") {
        localStorage.removeItem(`otpExpiry_${email}`);
      }
    };
  }, [step, email]);

  if (!email) {
    return (
      <div className="reset-password-otp-container">
        <div className="reset-password-otp-card">
          <div className="error-message">
            Invalid reset session. Please try again.
          </div>
          <button
            onClick={() => navigate("/forgot-password")}
            className="back-button"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-otp-container">
      <div className="reset-password-otp-card">
        <div className="reset-password-otp-logo">
          <img
            src={skillSyncLogo}
            alt="SkillSync Logo"
            className="reset-password-otp-logo-img"
          />
        </div>

        {step === "otp" ? (
          <>
            <h1 className="reset-password-otp-title">
              Enter Verification Code
            </h1>
            <p className="reset-password-otp-subtitle">
              We sent a 6-digit code to your email
            </p>
            <p className="email-display">{email}</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form
              onSubmit={handleVerifyOTP}
              className="reset-password-otp-form"
            >
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="otp-input"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="timer-section">
                {timeLeft > 0 ? (
                  <p className="timer">
                    Code expires in: {formatTime(timeLeft)}
                  </p>
                ) : (
                  <p className="timer-expired">Code has expired</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || timeLeft <= 0}
                className="verify-button"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div className="resend-section">
              <p>Didn't receive the code or code expired?</p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="resend-button"
              >
                Resend Code
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="reset-password-otp-title">Set New Password</h1>
            <p className="reset-password-otp-subtitle">
              Create a new password for your account
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleResetPassword} className="password-form">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password:
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="change-password-button"
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          </>
        )}

        <div className="back-section">
          <button
            onClick={() => {
              // Clear stored data when going back
              localStorage.removeItem(`otpExpiry_${email}`);
              navigate("/login");
            }}
            className="back-button"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordOTP;
