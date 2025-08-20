const Employee = require('../model/Employee');
const newConstruction = require('../model/newConstruction');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendWelcomeEmail, sendForgotPasswordEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword,companyCode, } = req.body;

    // Check if user already exists
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new Employee({
      name,
      email,
      phone,
      password,
      confirmPassword,
      companycode:companyCode

    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);
    
    if (!emailResult.success) {
      // If email fails, delete the user and return error
      await Employee.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification OTP.',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify Email OTP
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified
        }
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send new OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Check if admin verification is required (only for non-admin users)
    if (user.role === 'user' && !user.isAdminVerified) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending admin verification. Please contact your administrator.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    // await user.resetLoginAttempts();

    // Generate token
    const token = generateToken(user._id);

    // Populate assigned sites
    await user.populate('assignedSites', 'siteName siteCode address');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isAdminVerified: user.isAdminVerified,
          assignedSites: user.assignedSites
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await Employee.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    const user = await Employee.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin verification functions
const getPendingUsers = async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await Employee.findById(req.userId);
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const pendingUsers = await Employee.find({
      isEmailVerified: true,
      isAdminVerified: false,
      role: 'user'
    }).select('-password');

    res.status(200).json({
      success: true,
      data: {
        pendingUsers
      }
    });

  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { userId, assignedSites } = req.body;

    // Check if current user is admin
    const currentUser = await Employee.findById(req.userId);
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const userToVerify = await Employee.findById(userId);
    if (!userToVerify) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify the user
    userToVerify.isAdminVerified = true;
    userToVerify.adminVerifiedBy = req.userId;
    userToVerify.adminVerifiedAt = new Date();

    // Assign sites if provided
    if (assignedSites && assignedSites.length > 0) {
      // Verify that all site IDs are valid
      const validSites = await newConstruction.find({
        _id: { $in: assignedSites }
      });

      if (validSites.length !== assignedSites.length) {
        return res.status(400).json({
          success: false,
          message: 'Some site IDs are invalid'
        });
      }

      userToVerify.assignedSites = assignedSites;
    }

    await userToVerify.save();

    // Populate assigned sites for response
    await userToVerify.populate('assignedSites', 'siteName siteCode address');

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      data: {
        user: {
          id: userToVerify._id,
          name: userToVerify.name,
          email: userToVerify.email,
          phone: userToVerify.phone,
          role: userToVerify.role,
          isEmailVerified: userToVerify.isEmailVerified,
          isAdminVerified: userToVerify.isAdminVerified,
          assignedSites: userToVerify.assignedSites
        }
      }
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const assignSitesToUser = async (req, res) => {
  try {
    const { userId, siteIds } = req.body;

    // Check if current user is admin
    const currentUser = await Employee.findById(req.userId);
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const user = await Employee.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that all site IDs are valid
    const validSites = await newConstruction.find({
      _id: { $in: siteIds }
    });

    if (validSites.length !== siteIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some site IDs are invalid'
      });
    }

    // Update user's assigned sites
    user.assignedSites = siteIds;
    await user.save();

    // Populate assigned sites for response
    await user.populate('assignedSites', 'siteName siteCode address');

    res.status(200).json({
      success: true,
      message: 'Sites assigned successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isAdminVerified: user.isAdminVerified,
          assignedSites: user.assignedSites
        }
      }
    });

  } catch (error) {
    console.error('Assign sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllSites = async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await Employee.findById(req.userId);
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const sites = await newConstruction.find({}).select('siteName siteCode address');

    res.status(200).json({
      success: true,
      data: {
        sites
      }
    });

  } catch (error) {
    console.error('Get all sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forgot Password - Request OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first before requesting password reset'
      });
    }

    // Generate forgot password OTP
    const otp = user.generateForgotPasswordOTP();
    await user.save();

    // Send forgot password OTP email
    const emailResult = await sendForgotPasswordEmail(email, otp, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset Password - Verify OTP and set new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify forgot password OTP
    const isValidOTP = user.verifyForgotPasswordOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Resend Forgot Password OTP
const resendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first before requesting password reset'
      });
    }

    // Generate new forgot password OTP
    const otp = user.generateForgotPasswordOTP();
    await user.save();

    // Send new forgot password OTP email
    const emailResult = await sendForgotPasswordEmail(email, otp, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('Resend forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  getCurrentUser,
  logout,
  changePassword,
  getPendingUsers,
  verifyUser,
  assignSitesToUser,
  getAllSites,
  forgotPassword,
  resetPassword,
  resendForgotPasswordOTP
};
