const express = require('express');
const router = express.Router();
const {
    addLabour,
    getLabour,
    getLabourById,
    updateLabour,
    deleteLabour,
    getLabourStats
} = require('../controllers/labourController');

// GET /labour - Get all labour entries (with optional filters)
router.get('/', getLabour);

// GET /labour/stats/:projectId - Get labour statistics for a project
router.get('/stats/:projectId', getLabourStats);

// GET /labour/:id - Get labour entry by ID
router.get('/:id', getLabourById);

// POST /labour - Add new labour entry
router.post('/', addLabour);

// PUT /labour/:id - Update labour entry
router.put('/:id', updateLabour);

// DELETE /labour/:id - Delete labour entry
router.delete('/:id', deleteLabour);

module.exports = router;