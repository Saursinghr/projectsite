const mongoose = require('mongoose');

const ExpensesSchema = new mongoose.Schema({
  siteId: { type: String, required: true },
  siteName: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  referenceNumber: { type: String },
  description: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expenses', ExpensesSchema);
