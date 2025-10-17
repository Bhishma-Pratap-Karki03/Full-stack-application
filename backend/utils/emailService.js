const nodemailer = require("nodemailer");

// Create transporter (using Gmail) - FIXED METHOD NAME
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your Gmail app password
  },
});

// Send verification email with OTP
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Account - SkillSync",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">SkillSync</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Account Verification</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with SkillSync! To complete your registration, 
              please use the following verification code:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #1f2937; color: white; 
                         padding: 15px 30px; font-size: 32px; font-weight: bold; 
                         letter-spacing: 8px; border-radius: 8px;">
                ${otp}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">
              This code will expire in 10 minutes. If you didn't create an account with SkillSync, 
              please ignore this email.
            </p>
          </div>
          <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">&copy; 2024 SkillSync. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to SkillSync!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to SkillSync!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your account has been successfully verified</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name},</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Congratulations! Your account has been successfully verified and is now active. 
              Welcome to the SkillSync community!
            </p>
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #047857; margin-bottom: 0;">
                <li>Complete your profile</li>
                <li>Connect with other professionals</li>
                <li>Take skill assessment quizzes</li>
                <li>Explore learning resources</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3001" 
                 style="display: inline-block; background: #10b981; color: white; 
                        padding: 12px 30px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold; font-size: 16px;">
                Get Started
              </a>
            </div>
          </div>
          <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">&copy; 2024 SkillSync. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("Welcome email sending error:", error);
    return false;
  }
};

// Send password reset email with OTP
const sendPasswordResetEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - SkillSync",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">SkillSync</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password for your SkillSync account. 
              Use the following verification code to proceed:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #1f2937; color: white; 
                         padding: 15px 30px; font-size: 32px; font-weight: bold; 
                         letter-spacing: 8px; border-radius: 8px;">
                ${otp}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">
              This code will expire in 10 minutes. If you didn't request a password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
          </div>
          <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">&copy; 2024 SkillSync. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("Password reset email sending error:", error);
    return false;
  }
};

// Send password changed confirmation email
const sendPasswordChangedEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Changed Successfully - SkillSync",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">SkillSync</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Password Updated</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Changed Successfully</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Hello ${name}, your SkillSync account password has been successfully changed.
            </p>
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin-top: 0;">Security Notice:</h3>
              <ul style="color: #047857; margin-bottom: 0;">
                <li>Your password was updated on ${new Date().toLocaleDateString()}</li>
                <li>If you didn't make this change, please contact support immediately</li>
                <li>Keep your password secure and don't share it with anyone</li>
              </ul>
            </div>
          </div>
          <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">&copy; 2024 SkillSync. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password changed email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("Password changed email sending error:", error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail, // Add this
  sendPasswordChangedEmail, // Add this
};
