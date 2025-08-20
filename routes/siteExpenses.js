const express = require('express');
const router = express.Router();
const siteExpensesController = require('../controllers/siteExpensesController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/site-expenses';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload multiple files
const uploadMultiple = upload.array('documents', 10); // Allow up to 10 files

// Get expenses by site ID
router.get('/:siteId', siteExpensesController.getSiteExpenses);

// Add new expense for a specific site with file uploads
router.post('/', uploadMultiple, siteExpensesController.handleUploadError, siteExpensesController.addSiteExpense);

// Update expense by ID
router.put('/:id', siteExpensesController.updateSiteExpense);

// Delete expense by ID
router.delete('/:id', siteExpensesController.deleteSiteExpense);

// Download document from site expense
router.get('/:expenseId/document/:documentIndex/download', siteExpensesController.downloadDocument);

module.exports = router; 