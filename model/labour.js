const mongoose = require('mongoose');

const LabourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mason: {
        type: Number,
        required: true,
        min: 0
    },
    helper: {
        type: Number,
        required: true,
        min: 0
    },
    supply: {
        type: String,
        required: true,
        min: 0
    },
    date: {
        type: String,
        required: true
    },
    projectId: {
        type: String,
        required: true
    }
}, { 
    timestamps: true,
    collection: 'Labour'
});

module.exports = mongoose.model('Labour', LabourSchema);