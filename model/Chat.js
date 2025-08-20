const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isUser: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by siteId and timestamp
chatSchema.index({ siteId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema); 