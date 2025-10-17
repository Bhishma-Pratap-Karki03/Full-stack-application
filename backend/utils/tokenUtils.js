const jwt = require("jsonwebtoken");

const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP expiry time
const getOTPExpiryTime = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.AUTH_SECRET_KEY, {
    expiresIn: "24h",
  });
};

module.exports = {
  generateOTP,
  getOTPExpiryTime,
  generateToken,
  OTP_EXPIRY_MINUTES,
};
