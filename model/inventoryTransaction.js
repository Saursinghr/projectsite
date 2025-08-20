const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    materialName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    transactionType: {
        type: String,
        enum: ['add', 'remove', 'update'], // you can expand if needed
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
    }
});

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);
