const Material = require('../model/material');
const InventoryTransaction = require('../model/inventoryTransaction');

// Add new material
exports.addMaterial = async (req, res) => {
    try {
        const { material, quantity, unit, status, stockLevel, date, projectId, purpose,storageLocation } = req.body;

        if (!material || !quantity || !unit || !status || !stockLevel || !date || !projectId) {
            return res.status(400).json({ 
                message: 'Material, quantity, unit, status, stockLevel, date, and project ID are required' 
            });
        }

        const newMaterial = new Material({
            material,
            quantity,
            unit,
            status,
            stockLevel,
            date,
            projectId,
            storageLocation,
            purpose: purpose || ''
        });

        const savedMaterial = await newMaterial.save();
        
        // Create transaction record for adding material
        const transaction = new InventoryTransaction({
            materialName: material,
            quantity: Number(quantity),
            unit: unit,
            description: `Added ${quantity} ${unit} of ${material}`,
            transactionType: 'add',
            projectId: projectId,
            materialId: savedMaterial._id
        });
        await transaction.save();
        
        res.status(201).json({
            message: 'Material added successfully',
            material: savedMaterial
        });

    } catch (error) {
        console.error('Error adding material:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all materials with optional filters
exports.getMaterials = async (req, res) => {
    try {
        const { projectId } = req.query;
        let filter = {};

        if (projectId) {
            filter.projectId = projectId;
        }

        const materials = await Material.find(filter).sort({ createdAt: -1 });
        
        res.status(200).json({
            message: 'Materials retrieved successfully',
            count: materials.length,
            materials
        });

    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const material = await Material.findById(id);
        
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        res.status(200).json({
            message: 'Material retrieved successfully',
            material
        });

    } catch (error) {
        console.error('Error fetching material:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update material
exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Get the original material to compare changes
        const originalMaterial = await Material.findById(id);
        if (!originalMaterial) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const material = await Material.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Create transaction record for material update
        const changes = [];
        if (updateData.material && updateData.material !== originalMaterial.material) {
            changes.push(`Name: ${originalMaterial.material} → ${updateData.material}`);
        }
        if (updateData.quantity !== undefined && updateData.quantity !== originalMaterial.quantity) {
            changes.push(`Quantity: ${originalMaterial.quantity} → ${updateData.quantity}`);
        }
        if (updateData.unit && updateData.unit !== originalMaterial.unit) {
            changes.push(`Unit: ${originalMaterial.unit} → ${updateData.unit}`);
        }
        if (updateData.status && updateData.status !== originalMaterial.status) {
            changes.push(`Status: ${originalMaterial.status} → ${updateData.status}`);
        }
        if (updateData.stockLevel !== undefined && updateData.stockLevel !== originalMaterial.stockLevel) {
            changes.push(`Stock Level: ${originalMaterial.stockLevel} → ${updateData.stockLevel}`);
        }
        if (updateData.purpose !== undefined && updateData.purpose !== originalMaterial.purpose) {
            changes.push(`Purpose: ${originalMaterial.purpose || 'None'} → ${updateData.purpose || 'None'}`);
        }

        if (changes.length > 0) {
            const transaction = new InventoryTransaction({
                materialName: material.material,
                quantity: Number(material.quantity),
                unit: material.unit,
                description: `Updated ${material.material}: ${changes.join(', ')}`,
                transactionType: 'update',
                projectId: material.projectId,
                materialId: material._id
            });
            await transaction.save();
        }

        res.status(200).json({
            message: 'Material updated successfully',
            material
        });

    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        
        const material = await Material.findByIdAndDelete(id);
        
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        res.status(200).json({
            message: 'Material deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update material quantity (for stock management)
exports.updateMaterialQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

        if (!quantity || !operation) {
            return res.status(400).json({ message: 'Quantity and operation are required' });
        }

        const material = await Material.findById(id);
        
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        let newQuantity =parseInt(material.quantity);
        
        if (operation === 'add') {
            newQuantity += quantity;
        } else if (operation === 'subtract') {
            newQuantity -= quantity;
            if (newQuantity < 0) {
                return res.status(400).json({ message: 'Insufficient quantity in stock' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid operation. Use "add" or "subtract"' });
        }

        // Update status based on quantity
        let status = 'In Stock';
        if (newQuantity === 0) {
            status = 'Out of Stock';
        } else if (newQuantity <= material.lowStockThreshold) {
            status = 'Low Stock';
        }

        const updatedMaterial = await Material.findByIdAndUpdate(
            id,
            { quantity: newQuantity, status },
            { new: true, runValidators: true }
        );

        // Create transaction record for quantity update
        const transaction = new InventoryTransaction({
            materialName: updatedMaterial.material,
            quantity: Number(quantity),
            unit: updatedMaterial.unit,
            description: `${operation === 'add' ? 'Added' : 'Removed'} ${quantity} ${updatedMaterial.unit} of ${updatedMaterial.material} (Stock: ${material.quantity} → ${newQuantity})`,
            transactionType: operation === 'add' ? 'add' : 'remove',
            projectId: updatedMaterial.projectId,
            materialId: updatedMaterial._id
        });
        await transaction.save();

        res.status(200).json({
            message: 'Material quantity updated successfully',
            material: updatedMaterial
        });

    } catch (error) {
        console.error('Error updating material quantity:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 