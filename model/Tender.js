const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim : true
    },
    amount: {
      type: Number,
      required: true,
    },
    emd: {
      type: Number,
      required: true,
    },
    defectLiabilityPeriod: {
      type: Number,
      default: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
    },
    rejectionReason: {
    type: String,
    trim: true,
  }

}, { collection: 'Tender' }); // Explicitly sets collection name

module.exports = mongoose.model('Tender', TenderSchema);