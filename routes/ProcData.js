const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  updateRequest, 
  markAsTransit,
  markAsDelivered,
  cancelRequest, 
  getRequestStats,
  getAllRequests 
} = require('../controllers/ProcData');

router.get('/all', getAllRequests);
router.get('/', getRequestStats);
router.post('/', createRequest);
router.put('/:id', updateRequest);
router.patch('/:id/transit', markAsTransit);
router.patch('/:id/delivered', markAsDelivered);
router.patch('/:id/cancel', cancelRequest);

module.exports = router;
