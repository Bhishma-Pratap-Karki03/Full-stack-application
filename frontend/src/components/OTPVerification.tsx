import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./OTPVerification.css";

type OTPVerificationProps = {
  userId?: string;
  email?: string;
  expiresIn?: number;
};

const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [searchParams] = useSearchParams();
  // Prefer props when provided (e.g., from register flow), fallback to URL params (e.g., from login flow)
  const userIdFromUrl = searchParams.get("userId") || "";
  const emailFromUrl = searchParams.get("email") || "";
  const hasValidOTPParam = searchParams.get("hasValidOTP") === "true";
  const initialUserId = props.userId ?? userIdFromUrl;
  const initialEmail = props.email ?? emailFromUrl;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(props.expiresIn ?? 0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasValidOTP, setHasValidOTP] = useState<boolean>(
    hasValidOTPParam || (props.expiresIn ?? 0) > 0
  );
  const navigate = useNavigate();

  // Fetch OTP status on component mount
  useEffect(() => {
    const effectiveEmail = initialEmail;
    if (
      effectiveEmail &&
      !hasValidOTPParam &&
      !(props.expiresIn && props.expiresIn > 0)
    ) {
      checkOTPStatus(effectiveEmail);
    } else if (hasValidOTPParam) {
      setTimeLeft(600); // Default 10 minutes if we don't have exact time
    }
  }, [initialEmail, hasValidOTPParam, props.expiresIn]);

  const checkOTPStatus = async (effectiveEmail: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/check-verification",
        { email: effectiveEmail }
      );

      setHasValidOTP(response.data.hasValidOTP);
      setTimeLeft(response.data.timeLeft || 0);
    } catch (error) {
      console.error("Error checking OTP status:", error);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setHasValidOTP(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Handle OTP input change
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  // Handle key events
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace
      const prevInput = e.currentTarget.previousSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify-otp",
        {
          userId: initialUserId,
          otp: otpString,
        }
      );

      if (response.data.token) {
        setSuccess("Account verified successfully! Please log in.");

        // Redirect to login page after success
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Verification failed. Please try again."
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
        "http://localhost:3000/api/auth/resend-otp",
        {
          email: initialEmail,
        }
      );

      setTimeLeft(response.data.expiresIn);
      setHasValidOTP(true);
      setSuccess("New verification code sent to your email!");
      setOtp(["", "", "", "", "", ""]);

      // Clear success message after 3 seconds
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

  if (!initialUserId || !initialEmail) {
    return (
      <div className="otp-verification-container">
        <div className="otp-verification-card">
          <div className="error-message">
            Invalid verification session. Please try logging in again.
          </div>
          <button onClick={() => navigate("/login")} className="verify-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <div className="otp-header">
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit code to your email</p>
          <p className="email-display">{initialEmail}</p>
          {!hasValidOTP && (
            <div className="warning-message">
              Your previous verification code has expired. Please request a new
              one.
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
                disabled={isLoading || !hasValidOTP}
              />
            ))}
          </div>

          <div className="timer-section">
            {hasValidOTP && timeLeft > 0 ? (
              <p className="timer">Code expires in: {formatTime(timeLeft)}</p>
            ) : (
              <p className="timer-expired">Code has expired</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !hasValidOTP}
            className="verify-button"
          >
            {isLoading ? (
              <>
                <span className="button-loader"></span>
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
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

        {/* Back to Login button removed by request */}
      </div>
    </div>
  );
};

export default OTPVerification;
