const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-forgot-password-otp', authController.resendForgotPasswordOTP);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);
router.post('/change-password', authenticateToken, authController.changePassword);

// Admin routes (admin authentication required)
router.get('/pending-users', authenticateToken, authController.getPendingUsers);
router.post('/verify-user', authenticateToken, authController.verifyUser);
router.post('/assign-sites', authenticateToken, authController.assignSitesToUser);
router.get('/all-sites', authenticateToken, authController.getAllSites);

module.exports = router;
