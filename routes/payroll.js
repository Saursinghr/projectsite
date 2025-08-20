const express = require('express');
const router = express.Router();
const {
  getAllPayrolls,
  getPayrollByEmployee,
  createOrUpdatePayroll,
  addPayment,
  getPaymentHistory,
  deletePayment
} = require('../controllers/payrollController');

// Get all payrolls
router.get('/', getAllPayrolls);

// Get payroll by employee ID
router.get('/employee/:employeeId', getPayrollByEmployee);

// Create or update payroll for employee
router.post('/employee', createOrUpdatePayroll);

// Add payment to payroll
router.post('/employee/:employeeId/payment', addPayment);

// Get payment history for employee
router.get('/employee/:employeeId/payments', getPaymentHistory);

// Delete payment
router.delete('/employee/:employeeId/payment/:paymentId', deletePayment);

module.exports = router; 