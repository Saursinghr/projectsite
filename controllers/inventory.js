const Inventory = require('../model/Inventory');
const InventoryTransaction = require('../model/inventoryTransaction'); 

exports.inventoryPost = async (req, res) => {
    // Destructure all required fields from req.body
    const {
        MaterialName,
        MaterialType,
        Quantity,
        Unit,
        LowStockThreshold,
        TargetStockLevel,
        VendorSupplier,
        StorageLocation,
        Description
    } = req.body;
    const newInventory = new Inventory({
        MaterialName,
        MaterialType,
        Quantity,
        Unit,
        LowStockThreshold,
        TargetStockLevel,
        VendorSupplier,
        StorageLocation,
        Description
    });

    try {
        const savedInventory = await newInventory.save();

        // Save transaction record
        const transaction = new InventoryTransaction({
            materialName: MaterialName,
            quantity: Number(Quantity),
            unit: Unit,
            description: Description || `Added ${Quantity} ${Unit} of ${MaterialName}`,
            transactionType: 'add',
            projectId: req.body.projectId || 'default'
        });

        await transaction.save();

        res.status(201).json(savedInventory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Remove material from inventory
exports.removeMaterial = async (req, res) => {
    const { materialId, quantity, description } = req.body;

    try {
        const material = await Inventory.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        if (material.Quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Update inventory quantity
        material.Quantity -= quantity;
        await material.save();

        // Save transaction record
        const transaction = new InventoryTransaction({
            materialName: material.MaterialName,
            quantity: Number(quantity),
            unit: material.Unit,
            description: description || `Removed ${quantity} ${material.Unit} of ${material.MaterialName}`,
            transactionType: 'remove',
            projectId: req.body.projectId || 'default'
        });

        await transaction.save();

        res.status(200).json(material);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 👇 Add this code in controllers/InventoryController.js

exports.GetData = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ MaterialName: 1 });
        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const { materialName, projectId } = req.query;
        let query = {};
        
        if (materialName) {
            query.materialName = { $regex: materialName, $options: 'i' };
        }
        
        if (projectId) {
            query.projectId = projectId;
        }
        
        const transactions = await InventoryTransaction.find(query).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTransactionsByDate = async (req, res) => {
    const { startDate, endDate, projectId } = req.query;

    try {
        let query = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        
        if (projectId) {
            query.projectId = projectId;
        }
        
        const transactions = await InventoryTransaction.find(query);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTransactionsByProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const transactions = await InventoryTransaction.find({ projectId })
            .sort({ date: -1 })
            .populate('materialId', 'material quantity unit status purpose');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
