const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Contract', 'Invoice', 'Permit', 'Blueprint', 'Report', 'Other'],
        default: 'Other'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'newConstruction',
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['Active', 'Archived', 'Deleted'],
        default: 'Active'
    }
}, { 
    timestamps: true,
    collection: 'Documents'
});

// Create indexes for better search performance
DocumentSchema.index({ projectId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Document', DocumentSchema); 