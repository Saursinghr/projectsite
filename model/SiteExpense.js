const mongoose = require('mongoose');

const SiteExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  addedBy: { type: String, required: true },
  date: { type: Date, required: true },
  documents: [{ 
    fileName: { type: String },
    originalName: { type: String },
    filePath: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  site: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SiteExpense', SiteExpenseSchema); 