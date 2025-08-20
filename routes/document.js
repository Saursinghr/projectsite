const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    downloadDocument,
    updateDocument,
    deleteDocument,
    getDocumentStats,
    handleUploadError
} = require('../controllers/documentController');

// POST /document - Upload new document with file
router.post('/', handleUploadError, uploadDocument);

// GET /document - Get all documents with filters
router.get('/', getDocuments);

// GET /document/stats - Get document statistics
router.get('/stats', getDocumentStats);

// GET /document/:id - Get document by ID
router.get('/:id', getDocumentById);

// GET /document/:id/download - Download document file
router.get('/:id/download', downloadDocument);

// PUT /document/:id - Update document metadata
router.put('/:id', updateDocument);

// DELETE /document/:id - Delete document (soft delete)
router.delete('/:id', deleteDocument);

module.exports = router; 