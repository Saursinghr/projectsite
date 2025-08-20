const express = require('express');
const router = express.Router();
const {
    addMaterial,
    getMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    updateMaterialQuantity
} = require('../controllers/materialController');

// GET /materials - Get all materials (with optional filters)
router.get('/', getMaterials);

// GET /materials/:id - Get material by ID
router.get('/:id', getMaterialById);

// POST /materials - Add new material
router.post('/', addMaterial);

// PUT /materials/:id - Update material
router.put('/:id', updateMaterial);

// PATCH /materials/:id/quantity - Update material quantity
router.patch('/:id/quantity', updateMaterialQuantity);

// DELETE /materials/:id - Delete material
router.delete('/:id', deleteMaterial);

module.exports = router; 