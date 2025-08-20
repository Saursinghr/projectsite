const Purchase = require('../model/purchase');

exports.purchasePost = async (req, res) => {
    try {
        console.log('Received purchase data:', req.body);
        
        // Set RequestDate to current date if not provided
        const requestData = {
            ...req.body,
            RequestDate: req.body.RequestDate || new Date()
        };
        
        console.log('Current date:', new Date());
        console.log('Request date from body:', req.body.RequestDate);
        console.log('Request date after processing:', requestData.RequestDate);
        
        // Validate that RequestDate and DeliveryDate are different
        const requestDate = new Date(requestData.RequestDate);
        const deliveryDate = new Date(requestData.DeliveryDate);
        
        console.log('Request date object:', requestDate);
        console.log('Delivery date object:', deliveryDate);
        
        if (requestDate.getTime() === deliveryDate.getTime()) {
            return res.status(400).json({ 
                message: 'Request date and delivery date cannot be the same' 
            });
        }
        
        // Ensure RequestDate is not in the future (allow current date)
        const now = new Date();
        const requestDateOnly = new Date(requestDate);
        requestDateOnly.setHours(0, 0, 0, 0); // Reset to start of day for comparison
        now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
        
        console.log('Date validation - Now:', now);
        console.log('Date validation - Request date only:', requestDateOnly);
        console.log('Date validation - Is request date in future?', requestDateOnly > now);
        
        // More lenient validation - allow same day
        if (requestDateOnly > now) {
            return res.status(400).json({ 
                message: 'Request date cannot be in the future' 
            });
        }
        
        // Ensure DeliveryDate is in the future (allow same day or future)
        const today = new Date();
        const deliveryDateOnly = new Date(deliveryDate);
        deliveryDateOnly.setHours(0, 0, 0, 0); // Reset to start of day for comparison
        today.setHours(0, 0, 0, 0);
        
        console.log('Date validation - Today:', today);
        console.log('Date validation - Delivery date only:', deliveryDateOnly);
        console.log('Date validation - Is delivery date in past?', deliveryDateOnly < today);
        
        if (deliveryDateOnly < today) {
            return res.status(400).json({ 
                message: 'Delivery date must be today or in the future' 
            });
        }
        
        // Ensure required fields are present
        if (!requestData.ItemName || !requestData.Quantity || !requestData.Vendor || !requestData.Unit) {
            return res.status(400).json({ 
                message: 'Missing required fields: ItemName, Quantity, Vendor, and Unit are required' 
            });
        }
        
        // Ensure Priority is valid
        const validPriorities = ['Low', 'Medium', 'High', 'low', 'medium', 'high'];
        if (!validPriorities.includes(requestData.Priority)) {
            requestData.Priority = 'Low'; // Default to Low if invalid
        }
        
        console.log('Processed purchase data:', requestData);
        
        const newPurchase = new Purchase(requestData);
        const savedPurchase = await newPurchase.save();
        res.status(201).json(savedPurchase);
    } catch (err) {
        console.error('Purchase creation error:', err);
        res.status(400).json({ message: err.message });
    }
}

exports.GetData = async(req, res) =>{
    try {
        const { siteId } = req.query;
        let query = {};
        
        if (siteId) {
            query.siteId = siteId;
        }
        
        const purchases = await Purchase.find(query, 'ItemName Quantity Vendor DeliveryDate Priority siteId'); 
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Get procurement statistics
exports.getProcurementStats = async (req, res) => {
    try {
        const { siteId } = req.query;
        let query = {};
        
        if (siteId) {
            query.siteId = siteId;
        }
        
        const totalRequests = await Purchase.countDocuments(query);
        const pending = await Purchase.countDocuments({ ...query, Priority: 'Low' });
        const approved = await Purchase.countDocuments({ ...query, Priority: 'Medium' });
        const delivered = await Purchase.countDocuments({ ...query, Priority: 'High' });
        
        res.json({
            totalRequests,
            pending,
            approved,
            delivered
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all procurements with site filtering
exports.getAllProcurements = async (req, res) => {
    try {
        const { siteId } = req.query;
        let query = {};
        
        if (siteId) {
            query.siteId = siteId;
        }
        
        const procurements = await Purchase.find(query);
        res.json(procurements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update procurement status
exports.updateProcurementStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Map frontend status to backend status
        const statusMap = {
            'approved': 'approved',
            'delivered': 'delivered',
            'cancelled': 'cancelled',
            'in transit': 'in_transit',
            'pending': 'pending'
        };
        
        const backendStatus = statusMap[status.toLowerCase()] || 'pending';
        
        const updated = await Purchase.findByIdAndUpdate(
            id,
            { Status: backendStatus },
            { new: true }
        );
        
        if (!updated) {
            return res.status(404).json({ message: 'Procurement not found' });
        }
        
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update procurement
exports.updateProcurement = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const updated = await Purchase.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!updated) {
            return res.status(404).json({ message: 'Procurement not found' });
        }
        
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};