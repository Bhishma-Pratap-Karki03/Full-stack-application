const express = require("express");
const {
  register,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
  forgotPassword, // Add this import
  verifyResetOTP, // Add this import
  resetPassword, // Add this import
} = require("../controller/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/check-verification", checkVerificationStatus);
router.post("/forgot-password", forgotPassword); // Add this route
router.post("/verify-reset-otp", verifyResetOTP); // Add this route
router.post("/reset-password", resetPassword); // Add this route

module.exports = router;
