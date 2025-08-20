const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['salary', 'advance'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  monthlySalary: {
    type: Number,
    default: 0
  },
  totalAdvance: {
    type: Number,
    default: 0
  },
  payments: [paymentSchema],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema); 