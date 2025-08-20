const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    ItemName: {
        type: String,
    },
    Description: {
        type: String,
       
    },
    Quantity: {
        type: Number,
        required: true
    },
    Unit: {
        type: String,
        required: true
    },
    Budget: {
       type: Number,
        required: false,
        default: 0
    },
    Vendor: {
       type: String,
        required: true
    },
    Priority: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        enum: ['pending', 'approved', 'delivered', 'cancelled', 'in_transit'],
        default: 'pending'
    },
    RequestDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    DeliveryDate: {
        type: Date,
        required: true
    },
    AdditionalNotes: {
        type: String,
        
    },
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'newConstruction',
        required: false
    }

}, { collection: 'Purchase' }); // Explicitly sets collection name

module.exports = mongoose.model('Purchase', purchaseSchema);