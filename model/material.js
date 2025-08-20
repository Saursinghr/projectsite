const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    material: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        required: true,
        default: 'In Stock'
    },
    stockLevel: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        trim: true,
        default: ''
    },
    storageLocation: {
        type: String,
        trim: true,
        default: ''
    }
}, { 
    timestamps: true,
    collection: 'Materials'
});

module.exports = mongoose.model('Material', MaterialSchema); 