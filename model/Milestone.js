const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
        default: 'Pending'
    },
    estimatedCompletion: {
        type: Date,
        required: true
    },
    actualCompletion: {
        type: Date,
        default: null
    },
    description: {
        type: String,
        trim: true
    },
    projectId: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String,
        trim: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    }
}, { 
    timestamps: true,
    collection: 'Milestones'
});

module.exports = mongoose.model('Milestone', MilestoneSchema);
