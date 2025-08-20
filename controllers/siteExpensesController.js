const SiteExpense = require('../model/SiteExpense');
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

// Handle file upload errors
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
        }
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Get expenses by site ID
exports.getSiteExpenses = async (req, res) => {
  try {
    const { siteId } = req.params;
    const expenses = await SiteExpense.find({ site: siteId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new expense for a specific site with file uploads
exports.addSiteExpense = async (req, res) => {
  try {
    const { name, description, amount, addedBy, date, site } = req.body;
    
    // Prepare documents array from uploaded files
    const documents = req.files ? req.files.map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    })) : [];

    const expenseData = {
      name,
      description,
      amount: parseFloat(amount),
      addedBy,
      date: new Date(date),
      site,
      documents
    };

    const expense = new SiteExpense(expenseData);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update expense by ID
exports.updateSiteExpense = async (req, res) => {
  try {
    const updated = await SiteExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete expense by ID
exports.deleteSiteExpense = async (req, res) => {
  try {
    const deleted = await SiteExpense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Download document from site expense
exports.downloadDocument = async (req, res) => {
  try {
    const { expenseId, documentIndex } = req.params;

    const expense = await SiteExpense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const documentIndexNum = parseInt(documentIndex);
    if (documentIndexNum < 0 || documentIndexNum >= expense.documents.length) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = expense.documents[documentIndexNum];

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(document.filePath, document.originalName);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 