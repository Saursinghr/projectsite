const express = require('express');
const router = express.Router();
const {
    addMilestone,
    getMilestones,
    getMilestoneById,
    updateMilestone,
    deleteMilestone,
    updateMilestoneProgress
} = require('../controllers/milestoneController');

// GET /milestones - Get all milestones (with optional filters)
router.get('/', getMilestones);

// GET /milestones/:id - Get milestone by ID
router.get('/:id', getMilestoneById);

// POST /milestones - Add new milestone
router.post('/', addMilestone);

// PUT /milestones/:id - Update milestone
router.put('/:id', updateMilestone);

// PATCH /milestones/:id/progress - Update milestone progress
router.patch('/:id/progress', updateMilestoneProgress);

// DELETE /milestones/:id - Delete milestone
router.delete('/:id', deleteMilestone);

module.exports = router;
