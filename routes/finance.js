//route that will handle post requests from 
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance');

// Add new finance
router.post('/', financeController.addFinance);

// Get all finances
router.get('/', financeController.getFinances);

// Get finance summary by site
router.get('/summary', financeController.getFinanceSummary);

// Update finance by id
router.put('/:id', financeController.updateFinance);

// Delete finance by id
router.delete('/:id', financeController.deleteFinance);

// Extra Finance routes
router.post('/extra-finance', financeController.addExtraFinance);
router.get('/extra-finance', financeController.getExtraFinances);
router.put('/extra-finance/:id', financeController.updateExtraFinance);
router.delete('/extra-finance/:id', financeController.deleteExtraFinance);

// Add payment log to extra finance
router.post('/extra-finance/:id/payment-log', financeController.addPaymentLog);

module.exports = router; 