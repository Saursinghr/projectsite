const Document = require('../model/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/documents';
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

// Upload single file
const uploadSingle = upload.single('document');

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

// Upload document with file
const uploadDocumentHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, category, projectId, uploadedBy, tags } = req.body;

        if (!title || !projectId || !uploadedBy) {
            return res.status(400).json({ 
                message: 'Title, project ID, and uploaded by are required' 
            });
        }

        // Parse tags if provided as string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        }

        const newDocument = new Document({
            title,
            description: description || '',
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            category: 'Other', // Default category
            projectId,
            uploadedBy,
            tags: parsedTags
        });

        const savedDocument = await newDocument.save();
        
        res.status(201).json({
            message: 'Document uploaded successfully',
            document: savedDocument
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload document with file
exports.uploadDocument = (req, res) => {
    uploadSingle(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        uploadDocumentHandler(req, res);
    });
};

// Get all documents with filters
exports.getDocuments = async (req, res) => {
    try {
        const { 
            projectId, 
            category, 
            status = 'Active',
            search,
            page = 1,
            limit = 10
        } = req.query;

        let filter = { status };

        if (projectId) {
            filter.projectId = projectId;
        }

        if (category) {
            filter.category = category;
        }

        // Text search
        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const documents = await Document.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('projectId', 'siteName siteCode');

        const total = await Document.countDocuments(filter);

        res.status(200).json({
            message: 'Documents retrieved successfully',
            documents,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalDocuments: total,
                documentsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id)
            .populate('projectId', 'siteName siteCode');

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({
            message: 'Document retrieved successfully',
            document
        });

    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Download document file
exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(document.filePath, document.originalName);

    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update document metadata
exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, tags, status } = req.body;

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Parse tags if provided as string
        let parsedTags = document.tags;
        if (tags) {
            parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        }

        const updatedDocument = await Document.findByIdAndUpdate(
            id,
            {
                title: title || document.title,
                description: description !== undefined ? description : document.description,
                category: category || document.category,
                tags: parsedTags,
                status: status || document.status
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Document updated successfully',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete document (soft delete)
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Soft delete - mark as deleted
        await Document.findByIdAndUpdate(id, { status: 'Deleted' });

        res.status(200).json({
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get document statistics
exports.getDocumentStats = async (req, res) => {
    try {
        const { projectId } = req.query;
        let filter = { status: 'Active' };

        if (projectId) {
            filter.projectId = projectId;
        }

        const stats = await Document.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        const totalDocuments = await Document.countDocuments(filter);
        const totalSize = await Document.aggregate([
            { $match: filter },
            { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
        ]);

        res.status(200).json({
            message: 'Document statistics retrieved successfully',
            stats: {
                totalDocuments,
                totalSize: totalSize[0]?.totalSize || 0,
                byCategory: stats
            }
        });

    } catch (error) {
        console.error('Error fetching document stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    uploadDocument: exports.uploadDocument,
    getDocuments: exports.getDocuments,
    getDocumentById: exports.getDocumentById,
    downloadDocument: exports.downloadDocument,
    updateDocument: exports.updateDocument,
    deleteDocument: exports.deleteDocument,
    getDocumentStats: exports.getDocumentStats,
    handleUploadError: exports.handleUploadError
}; 