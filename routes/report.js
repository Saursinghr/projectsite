const express = require('express');
const router = express.Router();
const { generateSiteReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// Generate site report with authentication
router.get('/site-report', authenticateToken, generateSiteReport);

module.exports = router;
