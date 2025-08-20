const mongoose = require('mongoose');

const PaymentLogSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }, // This will include both date and time
  paidBy: { type: String, required: true }, // Who made the payment
  notes: { type: String }
}, { timestamps: true });

const ExtraFinanceSchema = new mongoose.Schema({
  siteId: { type: String, required: true },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  transferred: { type: Number, required: true },
  received: { type: Number, required: true },
  remaining: { type: Number, required: true },
  percentage: { type: Number, min: 0, max: 100, default: 0 }, // Percentage field
  receivableAmount: { type: Number, default: 0 }, // Receivable amount field
  paymentLogs: [PaymentLogSchema] // Array of payment logs
}, { timestamps: true });

module.exports = mongoose.model('ExtraFinance', ExtraFinanceSchema); 