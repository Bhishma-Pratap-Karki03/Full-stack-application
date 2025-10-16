const bcrypt = require("bcrypt");
const { generateToken, generateOTP, getOTPExpiryTime, OTP_EXPIRY_MINUTES } = require("../utils/tokenUtils");
const { sendVerificationEmail } = require("../utils/emailService");

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, profilePicture } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format and domain
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email ends with @gmail.com
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed for registration' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with unverified status
    const user = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture,
      otp,
      otpExpiry,
      isVerified: false,
      role: 'user',
    });

    // Save user to database
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      await User.deleteOne({ email }); // Clean up if email fails
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.status(201).json({
      message: 'Verification code sent to your email',
      userId: user._id,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// Verify OTP and complete registration
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to resend verification email' });
    }

    res.status(200).json({
      message: 'New verification code sent',
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  // ... other exports
};