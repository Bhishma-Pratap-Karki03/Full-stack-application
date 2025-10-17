const bcrypt = require("bcrypt");
const User = require("../model/userModel"); // Make sure path is correct
const {
  generateToken,
  generateOTP,
  getOTPExpiryTime,
  OTP_EXPIRY_MINUTES,
} = require("../utils/tokenUtils");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail, // Add this
  sendPasswordChangedEmail, // Add this
} = require("../utils/emailService");

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, profilePicture } = req.body;

    console.log("📨 Registration request received:", {
      name: name || "missing",
      email: email || "missing",
      password: password ? "***" : "missing",
      profilePicture: profilePicture || "not provided",
    });

    // Validate required fields
    if (!name || !email || !password) {
      console.log("❌ Missing required fields:", {
        name,
        email,
        password: password ? "***" : "missing",
      });
      return res.status(400).json({
        error: "Name, email, and password are required",
        details: `Received - Name: ${name || "missing"}, Email: ${
          email || "missing"
        }`,
      });
    }

    // Validate email format and domain
    if (typeof email !== "string" || !email.includes("@")) {
      console.log("❌ Invalid email format:", email);
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email ends with @gmail.com
    if (!email.endsWith("@gmail.com")) {
      console.log("❌ Non-Gmail address attempted:", email);
      return res.status(400).json({
        error: "Only Gmail addresses are allowed for registration",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({
        error: "User already exists with this email",
      });
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    console.log("🔐 Generated OTP for:", email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with unverified status
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      profilePicture: profilePicture || "",
      otp,
      otpExpiry,
      isVerified: false,
      role: "professional",
    });

    // Save user to database
    await user.save();
    console.log("✅ User saved to database:", user._id);

    // Send verification email
    console.log("📧 Sending verification email to:", email);
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      console.log("❌ Failed to send email, cleaning up user:", user._id);
      await User.deleteOne({ email }); // Clean up if email fails
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }

    console.log("✅ Verification email sent successfully to:", email);

    res.status(201).json({
      message: "Verification code sent to your email",
      userId: user._id,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
    });
  } catch (error) {
    console.error("💥 Registration error:", error);

    // More specific error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    res.status(500).json({
      error: "Registration failed. Please try again.",
    });
  }
};

// Verify OTP and complete registration
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    console.log("🔍 Verifying OTP for user:", userId);

    if (!userId || !otp) {
      return res.status(400).json({
        error: "User ID and OTP are required",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(
      "📋 User found, checking OTP. Expected:",
      user.otp,
      "Received:",
      otp
    );

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      console.log("❌ Invalid OTP for user:", userId);
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (user.otpExpiry < new Date()) {
      console.log("❌ Expired OTP for user:", userId);
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    console.log("✅ User verified successfully:", user.email);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log("✅ Welcome email sent to:", user.email);
    } catch (emailError) {
      console.error("⚠️ Failed to send welcome email:", emailError);
      // Don't fail the verification if welcome email fails
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Registration successful! Welcome to SkillSync!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("💥 Verification error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid user ID format",
      });
    }

    res.status(500).json({
      error: "Verification failed. Please try again.",
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🔄 Resending OTP request for:", email);

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for OTP resend:", email);
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: "User is already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    console.log("🔐 New OTP generated for:", email);

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new verification email
    console.log("📧 Resending verification email to:", email);
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      console.log("❌ Failed to resend verification email to:", email);
      return res.status(500).json({
        error: "Failed to resend verification email",
      });
    }

    console.log("✅ OTP resent successfully to:", email);

    res.status(200).json({
      message: "New verification code sent to your email",
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
    });
  } catch (error) {
    console.error("💥 Resend OTP error:", error);
    res.status(500).json({
      error: "Failed to resend verification code. Please try again.",
    });
  }
};

// Check if user needs verification and OTP status
const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🔍 Checking verification status for:", email);

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    // If user is already verified
    if (user.isVerified) {
      return res.status(200).json({
        isVerified: true,
        message: "User is already verified",
      });
    }

    // Check if OTP is still valid
    const isOTPValid = user.otpExpiry && user.otpExpiry > new Date();
    const timeLeft = isOTPValid ? Math.max(0, user.otpExpiry - new Date()) : 0;

    console.log("📋 Verification status:", {
      isVerified: user.isVerified,
      hasOTP: !!user.otp,
      isOTPValid,
      timeLeft: timeLeft / 1000,
    });

    res.status(200).json({
      isVerified: false,
      requiresVerification: true,
      userId: user._id,
      hasValidOTP: isOTPValid,
      timeLeft: Math.floor(timeLeft / 1000), // in seconds
      message: isOTPValid
        ? "Please enter the verification code sent to your email"
        : "Verification code has expired. Please request a new one.",
    });
  } catch (error) {
    console.error("💥 Verification status check error:", error);
    res.status(500).json({
      error: "Failed to check verification status. Please try again.",
    });
  }
};

// Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🔑 Forgot password request for:", email);

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for password reset:", email);
      // Return a different response when user doesn't exist
      return res.status(200).json({
        message: "No account found with this email address",
        userExists: false, // Add this flag to indicate user doesn't exist
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        error: "Please verify your email address first",
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    console.log("🔐 Generated password reset OTP for:", email);

    // Update user with reset OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send password reset email
    console.log("📧 Sending password reset email to:", email);
    const emailSent = await sendPasswordResetEmail(email, otp);

    if (!emailSent) {
      console.log("❌ Failed to send password reset email to:", email);
      return res.status(500).json({
        error: "Failed to send reset code. Please try again.",
      });
    }

    console.log("✅ Password reset OTP sent successfully to:", email);

    res.status(200).json({
      message: "Reset code has been sent to your email",
      userId: user._id,
      userExists: true, // Add this flag to indicate user exists
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
    });
  } catch (error) {
    console.error("💥 Forgot password error:", error);
    res.status(500).json({
      error: "Failed to process password reset request. Please try again.",
    });
  }
};

// Verify OTP for Password Reset
const verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    console.log("🔍 Verifying reset OTP for user:", userId);

    if (!userId || !otp) {
      return res.status(400).json({
        error: "User ID and OTP are required",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(
      "📋 User found, checking reset OTP. Expected:",
      user.otp,
      "Received:",
      otp
    );

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      console.log("❌ Invalid reset OTP for user:", userId);
      return res.status(400).json({ error: "Invalid reset code" });
    }

    if (user.otpExpiry < new Date()) {
      console.log("❌ Expired reset OTP for user:", userId);
      return res.status(400).json({ error: "Reset code has expired" });
    }

    // OTP is valid - don't clear it yet, wait for password change
    console.log("✅ Reset OTP verified successfully for:", user.email);

    res.status(200).json({
      message: "Reset code verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("💥 Reset OTP verification error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid user ID format",
      });
    }

    res.status(500).json({
      error: "Reset code verification failed. Please try again.",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    console.log("🔄 Resetting password for user:", userId);

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        error: "User ID, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP one more time before password change
    if (user.otp !== otp) {
      console.log("❌ Invalid reset OTP during password change:", userId);
      return res.status(400).json({ error: "Invalid reset code" });
    }

    if (user.otpExpiry < new Date()) {
      console.log("❌ Expired reset OTP during password change:", userId);
      return res.status(400).json({ error: "Reset code has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    console.log("✅ Password reset successfully for:", user.email);

    // Send password changed confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
      console.log("✅ Password changed email sent to:", user.email);
    } catch (emailError) {
      console.error("⚠️ Failed to send password changed email:", emailError);
      // Don't fail the reset if email fails
    }

    res.status(200).json({
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("💥 Password reset error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid user ID format",
      });
    }

    res.status(500).json({
      error: "Password reset failed. Please try again.",
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
  forgotPassword, // Add this
  verifyResetOTP, // Add this
  resetPassword, // Add this
};
