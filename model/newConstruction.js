const mongoose = require('mongoose');

const newConstruction = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        unique: true
    },
    siteCode: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    estimatedBudget: {
        type: Number,
        required: true
    },
    teamSize: {
        type: Number,
        required: true
    },
   startDate: {
        type: Date,
        required: true
    },
   endDate: {
        type: Date,
        required: true
    },
   assignedUsers: {
        type: [String],
        default: []
    }
}, { collection: 'newConstruction' }); // Explicitly sets collection name

module.exports = mongoose.model('newConstruction', newConstruction);